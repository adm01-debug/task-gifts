import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { pulseSurveysService } from "@/services/pulseSurveysService";
describe("pulseSurveysService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getActive returns array", async () => { expect(Array.isArray(await pulseSurveysService.getActive())).toBe(true); });
});
