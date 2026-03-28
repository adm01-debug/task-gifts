import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { feedbackService } from "@/services/feedbackService";

describe("feedbackService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getReceivedFeedback returns array", async () => {
    const r = await feedbackService.getReceivedFeedback("u1");
    expect(Array.isArray(r)).toBe(true);
  });
  it("getGivenFeedback returns array", async () => {
    const r = await feedbackService.getGivenFeedback("u1");
    expect(Array.isArray(r)).toBe(true);
  });
});
