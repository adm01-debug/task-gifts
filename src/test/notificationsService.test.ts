import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { notificationsService } from "@/services/notificationsService";

describe("notificationsService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getByUserId returns array", async () => {
    const r = await notificationsService.getByUserId("u1");
    expect(Array.isArray(r)).toBe(true);
  });
  it("getUnreadCount returns number", async () => {
    const r = await notificationsService.getUnreadCount("u1");
    expect(typeof r).toBe("number");
  });
});
