import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { moodTrackerService } from "@/services/moodTrackerService";
describe("moodTrackerService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getTodayMood returns null when none", async () => { expect(await moodTrackerService.getTodayMood("u1")).toBeNull(); });
});
