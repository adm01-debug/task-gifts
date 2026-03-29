import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { successionService } from "@/services/successionService";
describe("successionService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(successionService).toBeDefined();
    expect(typeof successionService).toBe("object");
  });
});
