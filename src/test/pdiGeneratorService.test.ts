import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { pdiGeneratorService } from "@/services/pdiGeneratorService";
describe("pdiGeneratorService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(pdiGeneratorService).toBeDefined();
    expect(typeof pdiGeneratorService).toBe("object");
  });
});
