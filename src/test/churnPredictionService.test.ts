import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { churnPredictionService } from "@/services/churnPredictionService";
describe("churnPredictionService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(churnPredictionService).toBeDefined();
    expect(typeof churnPredictionService).toBe("object");
  });
});
