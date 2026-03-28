import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { comboService } from "@/services/comboService";
describe("comboService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getActiveCombo returns null when no combo", async () => { expect(await comboService.getActiveCombo("u1")).toBeNull(); });
});
