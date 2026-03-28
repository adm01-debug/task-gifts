import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { achievementsService } from "@/services/achievementsService";
describe("achievementsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getAll returns array", async () => { expect(Array.isArray(await achievementsService.getAll())).toBe(true); });
  it("getByUserId returns array", async () => { expect(Array.isArray(await achievementsService.getByUserId("u1"))).toBe(true); });
});
