/**
 * Service Factory Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  withRetry,
  createResponse,
  createPaginatedResponse,
  getCached,
  setCache,
  clearCache,
} from "@/lib/serviceFactory";

describe("serviceFactory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
  });

  describe("withRetry", () => {
    it("should return result on first success", async () => {
      const operation = vi.fn().mockResolvedValue("success");
      const result = await withRetry(operation, { retryAttempts: 3, enableLogging: false });
      
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValueOnce("success");
      
      const result = await withRetry(operation, { 
        retryAttempts: 3, 
        retryDelay: 10,
        enableLogging: false 
      });
      
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should throw after max retries", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("always fails"));
      
      await expect(
        withRetry(operation, { retryAttempts: 2, retryDelay: 10, enableLogging: false })
      ).rejects.toThrow("always fails");
      
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe("createResponse", () => {
    it("should create success response", () => {
      const response = createResponse({ id: 1, name: "test" });
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: 1, name: "test" });
      expect(response.error).toBeNull();
    });

    it("should create error response", () => {
      const error = new Error("test error");
      const response = createResponse(null, error);
      
      expect(response.success).toBe(false);
      expect(response.data).toBeNull();
      expect(response.error).toBe(error);
    });
  });

  describe("createPaginatedResponse", () => {
    it("should indicate hasMore correctly", () => {
      const response = createPaginatedResponse([1, 2, 3], 10, 3);
      
      expect(response.hasMore).toBe(true);
      expect(response.count).toBe(10);
    });

    it("should indicate no more when less than pageSize", () => {
      const response = createPaginatedResponse([1, 2], 10, 3);
      
      expect(response.hasMore).toBe(false);
    });
  });

  describe("cache", () => {
    it("should cache and retrieve values", () => {
      setCache("test-key", { data: "test" });
      const cached = getCached<{ data: string }>("test-key");
      
      expect(cached).toEqual({ data: "test" });
    });

    it("should return null for expired cache", async () => {
      setCache("test-key", { data: "test" });
      
      // Get with very short TTL (already expired)
      const cached = getCached("test-key", -1);
      
      expect(cached).toBeNull();
    });

    it("should clear cache by pattern", () => {
      setCache("user-1", { id: 1 });
      setCache("user-2", { id: 2 });
      setCache("post-1", { id: 1 });
      
      clearCache("user");
      
      expect(getCached("user-1")).toBeNull();
      expect(getCached("user-2")).toBeNull();
      expect(getCached("post-1")).not.toBeNull();
    });
  });
});
