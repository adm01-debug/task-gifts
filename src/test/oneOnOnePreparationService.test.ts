import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { oneOnOnePreparationService } from "@/services/oneOnOnePreparationService";
describe("oneOnOnePreparationService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(oneOnOnePreparationService).toBeDefined();
    expect(typeof oneOnOnePreparationService).toBe("object");
  });
});
