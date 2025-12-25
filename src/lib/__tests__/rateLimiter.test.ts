/**
 * Rate Limiter Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimiter, rateLimitConfigs } from "@/lib/rateLimiter";

describe("rateLimiter", () => {
  beforeEach(() => {
    rateLimiter.resetAll();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("canExecute", () => {
    it("should allow first request", () => {
      expect(rateLimiter.canExecute("test", rateLimitConfigs.api)).toBe(true);
    });

    it("should allow requests within limit", () => {
      const config = { maxRequests: 3, windowMs: 1000 };
      
      rateLimiter.recordExecution("test", config);
      rateLimiter.recordExecution("test", config);
      
      expect(rateLimiter.canExecute("test", config)).toBe(true);
    });

    it("should block requests over limit", () => {
      const config = { maxRequests: 2, windowMs: 1000 };
      
      rateLimiter.recordExecution("test", config);
      rateLimiter.recordExecution("test", config);
      
      expect(rateLimiter.canExecute("test", config)).toBe(false);
    });

    it("should reset after window expires", () => {
      const config = { maxRequests: 1, windowMs: 1000 };
      
      rateLimiter.recordExecution("test", config);
      expect(rateLimiter.canExecute("test", config)).toBe(false);
      
      vi.advanceTimersByTime(1001);
      
      expect(rateLimiter.canExecute("test", config)).toBe(true);
    });
  });

  describe("execute", () => {
    it("should execute and return result when allowed", () => {
      const config = { maxRequests: 2, windowMs: 1000 };
      const result = rateLimiter.execute("test", config, () => "success");
      
      expect(result).toBe("success");
    });

    it("should return null when blocked", () => {
      const config = { maxRequests: 1, windowMs: 1000 };
      
      rateLimiter.execute("test", config, () => "first");
      const result = rateLimiter.execute("test", config, () => "second");
      
      expect(result).toBeNull();
    });
  });

  describe("executeAsync", () => {
    it("should execute async and return result when allowed", async () => {
      const config = { maxRequests: 2, windowMs: 1000 };
      const result = await rateLimiter.executeAsync("test", config, async () => "success");
      
      expect(result).toBe("success");
    });
  });

  describe("getTimeUntilReset", () => {
    it("should return 0 for new key", () => {
      expect(rateLimiter.getTimeUntilReset("new", rateLimitConfigs.api)).toBe(0);
    });

    it("should return remaining time", () => {
      const config = { maxRequests: 1, windowMs: 1000 };
      
      rateLimiter.recordExecution("test", config);
      
      const timeUntilReset = rateLimiter.getTimeUntilReset("test", config);
      expect(timeUntilReset).toBeGreaterThan(0);
      expect(timeUntilReset).toBeLessThanOrEqual(1000);
    });
  });

  describe("reset", () => {
    it("should reset specific key", () => {
      const config = { maxRequests: 1, windowMs: 1000 };
      
      rateLimiter.recordExecution("test", config);
      expect(rateLimiter.canExecute("test", config)).toBe(false);
      
      rateLimiter.reset("test");
      expect(rateLimiter.canExecute("test", config)).toBe(true);
    });
  });

  describe("blocking", () => {
    it("should block for specified duration", () => {
      const config = { maxRequests: 1, windowMs: 1000, blockDurationMs: 5000 };
      
      rateLimiter.recordExecution("test", config);
      expect(rateLimiter.canExecute("test", config)).toBe(false);
      
      // Still blocked after window expires
      vi.advanceTimersByTime(2000);
      expect(rateLimiter.canExecute("test", config)).toBe(false);
      
      // Unblocked after block duration
      vi.advanceTimersByTime(4000);
      expect(rateLimiter.canExecute("test", config)).toBe(true);
    });
  });
});
