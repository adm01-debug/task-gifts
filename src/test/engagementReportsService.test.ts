import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { engagementReportsService } from "@/services/engagementReportsService";
describe("engagementReportsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("exists and exports service object", () => {
    expect(engagementReportsService).toBeDefined();
    expect(typeof engagementReportsService).toBe("object");
  });
});
