import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@/services/loggingService";

describe("loggingService", () => {
  beforeEach(() => logger.clearLogs());

  it("stores log entries", () => {
    logger.warn("test warning", "test-ctx");
    const logs = logger.getRecentLogs(5);
    expect(logs.length).toBe(1);
    expect(logs[0].level).toBe("warn");
    expect(logs[0].message).toBe("test warning");
    expect(logs[0].context).toBe("test-ctx");
  });

  it("redacts PII fields", () => {
    logger.warn("auth event", "auth", { password: "secret123", email: "a@b.com" });
    const logs = logger.getRecentLogs(1);
    const data = logs[0].data as Record<string, unknown>;
    expect(data.password).toBe("[REDACTED]");
    // Email is not in PII list (it's in logs for identification), password is
  });

  it("respects max buffer size", () => {
    for (let i = 0; i < 250; i++) {
      logger.info(`msg-${i}`, "test");
    }
    const logs = logger.getRecentLogs(300);
    expect(logs.length).toBeLessThanOrEqual(200);
  });

  it("getLogsByLevel filters correctly", () => {
    logger.info("info msg", "test");
    logger.warn("warn msg", "test");
    logger.error("error msg", "test");
    const errors = logger.getLogsByLevel("error");
    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe("error msg");
  });

  it("setExternalHandler forwards errors", () => {
    const handler = vi.fn();
    logger.setExternalHandler(handler);
    logger.error("critical", "test");
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ level: "error" }));
    // Clean up
    logger.setExternalHandler(() => {});
  });

  it("clearLogs empties buffer", () => {
    logger.info("msg", "test");
    logger.clearLogs();
    expect(logger.getRecentLogs(10).length).toBe(0);
  });
});
