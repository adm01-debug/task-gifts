import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { behavioralBadgesService } from "@/services/behavioralBadgesService";
describe("behavioralBadgesService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getAll returns array", async () => { expect(Array.isArray(await behavioralBadgesService.getAll())).toBe(true); });
});
