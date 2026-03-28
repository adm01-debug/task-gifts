import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { certificationsService } from "@/services/certificationsService";
describe("certificationsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getByUserId returns array", async () => { expect(Array.isArray(await certificationsService.getByUserId("u1"))).toBe(true); });
});
