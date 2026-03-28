import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { nineBoxService } from "@/services/nineBoxService";
describe("nineBoxService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getAll returns array", async () => { expect(Array.isArray(await nineBoxService.getAll())).toBe(true); });
});
