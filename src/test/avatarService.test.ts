import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockAll } from "./helpers";
mockAll();
import { avatarService } from "@/services/avatarService";

describe("avatarService", () => {
  beforeEach(() => vi.clearAllMocks());
  it("getAvatarItems returns array", async () => {
    const r = await avatarService.getAvatarItems();
    expect(Array.isArray(r)).toBe(true);
  });
  it("getUserItems returns array", async () => {
    const r = await avatarService.getUserItems("u1");
    expect(Array.isArray(r)).toBe(true);
  });
});
