import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { highPotentialService } from "@/services/highPotentialService";
describe("highPotentialService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(highPotentialService).toBeDefined();
    expect(typeof highPotentialService).toBe("object");
  });
});
