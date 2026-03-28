import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { pdiService } from "@/services/pdiService";
describe("pdiService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getByUserId returns array", async () => { expect(Array.isArray(await pdiService.getByUserId("u1"))).toBe(true); });
  it("getTemplates returns array", async () => { expect(Array.isArray(await pdiService.getTemplates())).toBe(true); });
});
