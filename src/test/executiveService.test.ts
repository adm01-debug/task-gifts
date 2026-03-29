import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { executiveService } from "@/services/executiveService";
describe("executiveService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(executiveService).toBeDefined();
    expect(typeof executiveService).toBe("object");
  });
});
