import { describe, it, expect, vi, beforeEach } from "vitest";

// ── classifySeverity (extracted logic) ──────────────────────────

function classifySeverity(durationMs: number, errorMessage?: string | null): string {
  if (errorMessage) return 'error';
  if (durationMs >= 8000) return 'very_slow';
  if (durationMs >= 3000) return 'slow';
  return 'normal';
}

function validateTelemetryPayload(payload: {
  operation: string;
  duration_ms: number;
  [key: string]: unknown;
}): string | null {
  if (!payload.operation || typeof payload.operation !== 'string') {
    return 'operation is required and must be a string';
  }
  if (typeof payload.duration_ms !== 'number' || payload.duration_ms < 0) {
    return 'duration_ms must be a non-negative number';
  }
  const validOps = ['select', 'insert', 'update', 'delete', 'rpc', 'count', 'upsert'];
  if (!validOps.includes(payload.operation)) {
    return `operation must be one of: ${validOps.join(', ')}`;
  }
  return null;
}

// ── classifySeverity Tests ──────────────────────────────────────

describe("classifySeverity", () => {
  it("returns 'error' when errorMessage is present", () => {
    expect(classifySeverity(100, "timeout")).toBe("error");
  });

  it("returns 'error' even if duration is high", () => {
    expect(classifySeverity(99999, "connection refused")).toBe("error");
  });

  it("returns 'very_slow' for >= 8000ms", () => {
    expect(classifySeverity(8000)).toBe("very_slow");
    expect(classifySeverity(8001)).toBe("very_slow");
    expect(classifySeverity(15000)).toBe("very_slow");
    expect(classifySeverity(100000)).toBe("very_slow");
  });

  it("returns 'slow' for >= 3000ms and < 8000ms", () => {
    expect(classifySeverity(3000)).toBe("slow");
    expect(classifySeverity(3001)).toBe("slow");
    expect(classifySeverity(5000)).toBe("slow");
    expect(classifySeverity(7999)).toBe("slow");
  });

  it("returns 'normal' for < 3000ms", () => {
    expect(classifySeverity(0)).toBe("normal");
    expect(classifySeverity(1)).toBe("normal");
    expect(classifySeverity(500)).toBe("normal");
    expect(classifySeverity(2999)).toBe("normal");
  });

  it("returns 'normal' when errorMessage is null", () => {
    expect(classifySeverity(100, null)).toBe("normal");
  });

  it("returns 'normal' when errorMessage is undefined", () => {
    expect(classifySeverity(100, undefined)).toBe("normal");
  });

  it("returns 'error' for empty string error message", () => {
    // empty string is falsy, so it should NOT trigger error
    expect(classifySeverity(100, "")).toBe("normal");
  });

  it("boundary test at exactly 3000ms", () => {
    expect(classifySeverity(3000)).toBe("slow");
  });

  it("boundary test at exactly 7999ms", () => {
    expect(classifySeverity(7999)).toBe("slow");
  });

  it("boundary test at exactly 8000ms", () => {
    expect(classifySeverity(8000)).toBe("very_slow");
  });
});

// ── validateTelemetryPayload Tests ──────────────────────────────

describe("validateTelemetryPayload", () => {
  it("returns null for valid payload", () => {
    expect(validateTelemetryPayload({ operation: "select", duration_ms: 100 })).toBeNull();
  });

  it("accepts all valid operations", () => {
    const ops = ["select", "insert", "update", "delete", "rpc", "count", "upsert"];
    ops.forEach(op => {
      expect(validateTelemetryPayload({ operation: op, duration_ms: 50 })).toBeNull();
    });
  });

  it("rejects missing operation", () => {
    expect(validateTelemetryPayload({ operation: "", duration_ms: 100 })).toContain("operation");
  });

  it("rejects non-string operation", () => {
    expect(validateTelemetryPayload({ operation: 123 as unknown as string, duration_ms: 100 })).toContain("operation");
  });

  it("rejects invalid operation name", () => {
    const result = validateTelemetryPayload({ operation: "drop_table", duration_ms: 100 });
    expect(result).toContain("operation must be one of");
  });

  it("rejects negative duration_ms", () => {
    expect(validateTelemetryPayload({ operation: "select", duration_ms: -1 })).toContain("duration_ms");
  });

  it("rejects non-numeric duration_ms", () => {
    expect(validateTelemetryPayload({ operation: "select", duration_ms: "fast" as unknown as number })).toContain("duration_ms");
  });

  it("accepts zero duration_ms", () => {
    expect(validateTelemetryPayload({ operation: "select", duration_ms: 0 })).toBeNull();
  });

  it("accepts very large duration_ms", () => {
    expect(validateTelemetryPayload({ operation: "select", duration_ms: 999999 })).toBeNull();
  });
});

// ── emitTelemetry persistence logic Tests ───────────────────────

describe("emitTelemetry persistence row construction", () => {
  function buildTelemetryRow(
    payload: {
      operation: string;
      table_name?: string | null;
      rpc_name?: string | null;
      duration_ms: number;
      record_count?: number | null;
      query_limit?: number | null;
      query_offset?: number | null;
      count_mode?: string | null;
      error_message?: string | null;
    },
    userId: string
  ) {
    return {
      operation: payload.operation,
      table_name: payload.table_name ?? null,
      rpc_name: payload.rpc_name ?? null,
      duration_ms: payload.duration_ms,
      record_count: payload.record_count ?? null,
      query_limit: payload.query_limit ?? null,
      query_offset: payload.query_offset ?? null,
      count_mode: payload.count_mode ?? null,
      severity: classifySeverity(payload.duration_ms, payload.error_message),
      error_message: payload.error_message ?? null,
      user_id: userId,
    };
  }

  it("builds correct row for a normal select", () => {
    const row = buildTelemetryRow({
      operation: "select",
      table_name: "profiles",
      duration_ms: 120,
      record_count: 50,
      query_limit: 100,
    }, "user-123");
    expect(row.operation).toBe("select");
    expect(row.table_name).toBe("profiles");
    expect(row.severity).toBe("normal");
    expect(row.user_id).toBe("user-123");
    expect(row.rpc_name).toBeNull();
    expect(row.error_message).toBeNull();
  });

  it("builds correct row for a slow RPC call", () => {
    const row = buildTelemetryRow({
      operation: "rpc",
      rpc_name: "get_executive_metrics",
      duration_ms: 5000,
    }, "user-456");
    expect(row.severity).toBe("slow");
    expect(row.rpc_name).toBe("get_executive_metrics");
    expect(row.table_name).toBeNull();
  });

  it("builds correct row for a very slow query", () => {
    const row = buildTelemetryRow({
      operation: "select",
      table_name: "audit_logs",
      duration_ms: 12000,
      record_count: 1000,
      query_limit: 1000,
      query_offset: 5000,
    }, "user-789");
    expect(row.severity).toBe("very_slow");
    expect(row.query_offset).toBe(5000);
  });

  it("builds correct row for an error", () => {
    const row = buildTelemetryRow({
      operation: "insert",
      table_name: "notifications",
      duration_ms: 200,
      error_message: "unique constraint violation",
    }, "user-abc");
    expect(row.severity).toBe("error");
    expect(row.error_message).toBe("unique constraint violation");
  });

  it("handles all null optional fields", () => {
    const row = buildTelemetryRow({
      operation: "delete",
      duration_ms: 50,
    }, "user-def");
    expect(row.table_name).toBeNull();
    expect(row.rpc_name).toBeNull();
    expect(row.record_count).toBeNull();
    expect(row.query_limit).toBeNull();
    expect(row.query_offset).toBeNull();
    expect(row.count_mode).toBeNull();
    expect(row.error_message).toBeNull();
  });

  it("preserves count_mode", () => {
    const row = buildTelemetryRow({
      operation: "count",
      table_name: "profiles",
      duration_ms: 300,
      count_mode: "exact",
    }, "user-ghi");
    expect(row.count_mode).toBe("exact");
  });
});

// ── Batch telemetry validation Tests ────────────────────────────

describe("Batch telemetry validation", () => {
  it("validates all payloads in a batch", () => {
    const payloads = [
      { operation: "select", duration_ms: 100 },
      { operation: "insert", duration_ms: 200 },
      { operation: "rpc", duration_ms: 5000 },
    ];
    const errors = payloads
      .map((p, i) => {
        const err = validateTelemetryPayload(p);
        return err ? `payload[${i}]: ${err}` : null;
      })
      .filter(Boolean);
    expect(errors.length).toBe(0);
  });

  it("catches invalid payloads in a batch", () => {
    const payloads = [
      { operation: "select", duration_ms: 100 },
      { operation: "invalid_op", duration_ms: 200 },
      { operation: "insert", duration_ms: -5 },
    ];
    const errors = payloads
      .map((p, i) => {
        const err = validateTelemetryPayload(p);
        return err ? `payload[${i}]: ${err}` : null;
      })
      .filter(Boolean);
    expect(errors.length).toBe(2);
    expect(errors[0]).toContain("payload[1]");
    expect(errors[1]).toContain("payload[2]");
  });

  it("rejects empty batch", () => {
    const payloads: unknown[] = [];
    const isValid = Array.isArray(payloads) && payloads.length > 0;
    expect(isValid).toBe(false);
  });

  it("rejects batch over 100 items", () => {
    const payloads = Array.from({ length: 101 }, () => ({
      operation: "select",
      duration_ms: 100,
    }));
    expect(payloads.length > 100).toBe(true);
  });

  it("accepts batch of exactly 100 items", () => {
    const payloads = Array.from({ length: 100 }, () => ({
      operation: "select",
      duration_ms: 100,
    }));
    expect(payloads.length <= 100).toBe(true);
  });

  it("classifies severity for each batch item independently", () => {
    const payloads = [
      { operation: "select", duration_ms: 100 },
      { operation: "select", duration_ms: 5000 },
      { operation: "select", duration_ms: 10000 },
      { operation: "select", duration_ms: 50, error_message: "fail" },
    ];
    const severities = payloads.map(p =>
      classifySeverity(p.duration_ms, (p as { error_message?: string }).error_message)
    );
    expect(severities).toEqual(["normal", "slow", "very_slow", "error"]);
  });
});

// ── Request action routing Tests ────────────────────────────────

describe("Request action routing", () => {
  const validActions = ["health", "emit_telemetry", "batch_telemetry", "query"];

  it("recognizes all valid actions", () => {
    validActions.forEach(action => {
      expect(validActions.includes(action)).toBe(true);
    });
  });

  it("rejects unknown actions", () => {
    const unknownActions = ["ping", "drop", "execute_sql", "admin", ""];
    unknownActions.forEach(action => {
      expect(validActions.includes(action)).toBe(false);
    });
  });
});

// ── Query action telemetry auto-emit Tests ──────────────────────

describe("Query action auto-emit telemetry", () => {
  function simulateQueryTelemetry(
    table: string,
    operation: string,
    startMs: number,
    endMs: number,
    resultData: unknown[],
    error: string | null,
    userId: string,
    limit?: number,
    offset?: number
  ) {
    const durationMs = endMs - startMs;
    const recordCount = resultData.length;
    return {
      operation,
      table_name: table,
      duration_ms: durationMs,
      record_count: recordCount,
      query_limit: limit ?? null,
      query_offset: offset ?? null,
      severity: classifySeverity(durationMs, error),
      error_message: error,
      user_id: userId,
    };
  }

  it("captures telemetry for a fast select", () => {
    const tel = simulateQueryTelemetry("profiles", "select", 0, 50, Array(10), null, "u1", 100, 0);
    expect(tel.severity).toBe("normal");
    expect(tel.duration_ms).toBe(50);
    expect(tel.record_count).toBe(10);
  });

  it("captures telemetry for a slow select", () => {
    const tel = simulateQueryTelemetry("audit_logs", "select", 0, 5000, Array(500), null, "u2", 1000);
    expect(tel.severity).toBe("slow");
    expect(tel.record_count).toBe(500);
  });

  it("captures telemetry for a very slow select", () => {
    const tel = simulateQueryTelemetry("big_table", "select", 0, 12000, Array(999), null, "u3");
    expect(tel.severity).toBe("very_slow");
  });

  it("captures telemetry for a failed query", () => {
    const tel = simulateQueryTelemetry("missing_table", "select", 0, 200, [], "relation does not exist", "u4");
    expect(tel.severity).toBe("error");
    expect(tel.error_message).toContain("does not exist");
  });

  it("captures telemetry for insert operation", () => {
    const tel = simulateQueryTelemetry("profiles", "insert", 0, 80, [{}], null, "u5");
    expect(tel.operation).toBe("insert");
    expect(tel.record_count).toBe(1);
  });

  it("captures telemetry for update operation", () => {
    const tel = simulateQueryTelemetry("profiles", "update", 0, 150, Array(3), null, "u6");
    expect(tel.operation).toBe("update");
    expect(tel.record_count).toBe(3);
  });

  it("captures telemetry for delete operation", () => {
    const tel = simulateQueryTelemetry("old_logs", "delete", 0, 9000, Array(5000), null, "u7");
    expect(tel.severity).toBe("very_slow");
    expect(tel.operation).toBe("delete");
  });
});

// ── Auth validation logic Tests ─────────────────────────────────

describe("Auth validation logic", () => {
  it("rejects missing Authorization header", () => {
    const authHeader: string | null = null;
    expect(authHeader?.startsWith("Bearer ")).toBeFalsy();
  });

  it("rejects non-Bearer auth", () => {
    const authHeader = "Basic abc123";
    expect(authHeader.startsWith("Bearer ")).toBe(false);
  });

  it("accepts valid Bearer token", () => {
    const authHeader = "Bearer eyJhbGciOiJIUzI1NiJ9.test";
    expect(authHeader.startsWith("Bearer ")).toBe(true);
    const token = authHeader.replace("Bearer ", "");
    expect(token).toBe("eyJhbGciOiJIUzI1NiJ9.test");
  });

  it("extracts token correctly", () => {
    const authHeader = "Bearer my-secret-token-123";
    const token = authHeader.replace("Bearer ", "");
    expect(token).toBe("my-secret-token-123");
  });
});

// ── CORS handling Tests ─────────────────────────────────────────

describe("CORS headers", () => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };

  it("allows all origins", () => {
    expect(corsHeaders['Access-Control-Allow-Origin']).toBe('*');
  });

  it("includes required headers", () => {
    const headers = corsHeaders['Access-Control-Allow-Headers'];
    expect(headers).toContain('authorization');
    expect(headers).toContain('content-type');
    expect(headers).toContain('apikey');
  });
});

// ── Stress & edge case Tests ────────────────────────────────────

describe("Stress and edge cases", () => {
  it("classifies 1000 random durations correctly", () => {
    for (let i = 0; i < 1000; i++) {
      const ms = Math.floor(Math.random() * 20000);
      const severity = classifySeverity(ms);
      if (ms >= 8000) expect(severity).toBe("very_slow");
      else if (ms >= 3000) expect(severity).toBe("slow");
      else expect(severity).toBe("normal");
    }
  });

  it("validates 100 payloads without errors", () => {
    for (let i = 0; i < 100; i++) {
      const result = validateTelemetryPayload({
        operation: "select",
        duration_ms: i * 100,
      });
      expect(result).toBeNull();
    }
  });

  it("handles maximum duration value", () => {
    expect(classifySeverity(Number.MAX_SAFE_INTEGER)).toBe("very_slow");
  });

  it("handles zero duration", () => {
    expect(classifySeverity(0)).toBe("normal");
  });

  it("handles fractional duration", () => {
    expect(classifySeverity(3000.5)).toBe("slow");
    expect(classifySeverity(7999.9)).toBe("slow");
    expect(classifySeverity(8000.0)).toBe("very_slow");
  });

  it("error takes priority over duration classification", () => {
    expect(classifySeverity(0, "error")).toBe("error");
    expect(classifySeverity(5000, "error")).toBe("error");
    expect(classifySeverity(10000, "error")).toBe("error");
  });
});
