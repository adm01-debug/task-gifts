import { describe, it, expect } from "vitest";
import { generateRequestId, getCurrentRequestId, clearRequestId, withRequestId } from "@/lib/requestId";

describe("requestId", () => {
  it("generates unique IDs", () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^req_/);
  });

  it("tracks current request ID", () => {
    const id = generateRequestId();
    expect(getCurrentRequestId()).toBe(id);
  });

  it("clears request ID", () => {
    generateRequestId();
    clearRequestId();
    expect(getCurrentRequestId()).toBeNull();
  });

  it("withRequestId wraps async operations", async () => {
    let capturedId: string | null = null;
    await withRequestId(async () => {
      capturedId = getCurrentRequestId();
    });
    expect(capturedId).toMatch(/^req_/);
    expect(getCurrentRequestId()).toBeNull();
  });
});
