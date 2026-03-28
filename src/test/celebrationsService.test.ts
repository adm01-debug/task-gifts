import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { celebrationsService } from "@/services/celebrationsService";
describe("celebrationsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getUpcoming returns array", async () => { expect(Array.isArray(await celebrationsService.getUpcoming())).toBe(true); });
});
