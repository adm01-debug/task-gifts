import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { competencyService } from "@/services/competencyService";
describe("competencyService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(competencyService).toBeDefined();
    expect(typeof competencyService).toBe("object");
  });
});
