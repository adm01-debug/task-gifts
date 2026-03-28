import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { checkinsService } from "@/services/checkinsService";

describe("checkinsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getByUserId returns array", async () => {
    const r = await checkinsService.getByUserId("u1");
    expect(Array.isArray(r)).toBe(true);
  });
});
