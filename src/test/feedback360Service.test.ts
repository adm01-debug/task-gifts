import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { feedback360Service } from "@/services/feedback360Service";
describe("feedback360Service", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getCycles returns array", async () => { expect(Array.isArray(await feedback360Service.getCycles())).toBe(true); });
});
