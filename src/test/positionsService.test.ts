import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { positionsService } from "@/services/positionsService";
describe("positionsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getAll returns array", async () => { expect(Array.isArray(await positionsService.getAll())).toBe(true); });
});
