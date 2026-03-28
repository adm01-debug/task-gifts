import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { weeklyChallengesService } from "@/services/weeklyChallengesService";

describe("weeklyChallengesService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getCurrentChallenge returns null when none active", async () => {
    const r = await weeklyChallengesService.getCurrentChallenge();
    expect(r).toBeNull();
  });
});
