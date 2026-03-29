import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { auditService } from "@/services/auditService";
describe("auditService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(auditService).toBeDefined();
    expect(typeof auditService).toBe("object");
  });
});
