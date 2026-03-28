import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { aiCoachService } from "@/services/aiCoachService";
describe("aiCoachService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getHistory returns array", async () => { expect(Array.isArray(await aiCoachService.getHistory("u1"))).toBe(true); });
});
