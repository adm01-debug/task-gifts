import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { onboardingService } from "@/services/onboardingService";

describe("onboardingService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getProgress returns null when no record", async () => {
    const r = await onboardingService.getProgress("u1");
    expect(r).toBeNull();
  });
});
