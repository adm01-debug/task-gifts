import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { developmentPlanService } from "@/services/developmentPlanService";
describe("developmentPlanService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getByUserId returns array", async () => { expect(Array.isArray(await developmentPlanService.getByUserId("u1"))).toBe(true); });
});
