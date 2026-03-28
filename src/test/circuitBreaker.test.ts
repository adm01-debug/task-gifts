import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/loggingService", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { CircuitBreaker } from "@/lib/circuitBreaker";

describe("CircuitBreaker", () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker("test", { failureThreshold: 3, resetTimeoutMs: 100 });
  });

  it("starts CLOSED", () => {
    expect(breaker.getState()).toBe("CLOSED");
  });

  it("stays CLOSED on success", async () => {
    await breaker.execute(() => Promise.resolve("ok"));
    expect(breaker.getState()).toBe("CLOSED");
  });

  it("opens after threshold failures", async () => {
    const fail = () => Promise.reject(new Error("fail"));
    for (let i = 0; i < 3; i++) {
      await breaker.execute(fail).catch(() => {});
    }
    expect(breaker.getState()).toBe("OPEN");
  });

  it("rejects immediately when OPEN", async () => {
    const fail = () => Promise.reject(new Error("fail"));
    for (let i = 0; i < 3; i++) {
      await breaker.execute(fail).catch(() => {});
    }
    await expect(breaker.execute(() => Promise.resolve("ok"))).rejects.toThrow("OPEN");
  });

  it("transitions to HALF_OPEN after timeout", async () => {
    const fail = () => Promise.reject(new Error("fail"));
    for (let i = 0; i < 3; i++) {
      await breaker.execute(fail).catch(() => {});
    }
    // Wait for reset timeout
    await new Promise((r) => setTimeout(r, 150));
    // Next call should try (HALF_OPEN)
    await breaker.execute(() => Promise.resolve("ok"));
    expect(breaker.getState()).toBe("CLOSED");
  });

  it("reset() returns to CLOSED", async () => {
    const fail = () => Promise.reject(new Error("fail"));
    for (let i = 0; i < 3; i++) {
      await breaker.execute(fail).catch(() => {});
    }
    breaker.reset();
    expect(breaker.getState()).toBe("CLOSED");
  });
});
