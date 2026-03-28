import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { attendanceService } from "@/services/attendanceService";

describe("attendanceService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getTodayRecord returns null when no record", async () => {
    const r = await attendanceService.getTodayRecord("u1");
    expect(r).toBeNull();
  });
  it("getMonthlyRecords returns array", async () => {
    const r = await attendanceService.getMonthlyRecords("u1", 2026, 3);
    expect(Array.isArray(r)).toBe(true);
  });
});
