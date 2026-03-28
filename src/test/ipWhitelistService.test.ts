import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { ipWhitelistService } from "@/services/ipWhitelistService";
describe("ipWhitelistService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getAll returns array", async () => { expect(Array.isArray(await ipWhitelistService.getAll())).toBe(true); });
});
