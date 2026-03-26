import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: "1", xp: 100, level: 1 }, error: null }),
          }),
        }),
      }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "RPC not available" } }),
  },
}));

vi.mock("@/services/notificationsService", () => ({
  notificationsService: {
    notifyXpGain: vi.fn().mockResolvedValue(undefined),
    notifyLevelUp: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/services/auditService", () => ({
  auditService: {
    logXpGain: vi.fn().mockResolvedValue(undefined),
    logLevelUp: vi.fn().mockResolvedValue(undefined),
    logStreakUpdate: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/services/loggingService", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import { profilesService } from "@/services/profilesService";

describe("profilesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validation", () => {
    it("rejects negative XP in update", async () => {
      await expect(
        profilesService.update("user-1", { xp: -1 })
      ).rejects.toThrow("xp must be between 0 and 99999999");
    });

    it("rejects negative coins in update", async () => {
      await expect(
        profilesService.update("user-1", { coins: -5 })
      ).rejects.toThrow("coins must be between 0 and 99999999");
    });

    it("rejects level below 1", async () => {
      await expect(
        profilesService.update("user-1", { level: 0 })
      ).rejects.toThrow("level must be between 1 and 999");
    });

    it("rejects level above 999", async () => {
      await expect(
        profilesService.update("user-1", { level: 1000 })
      ).rejects.toThrow("level must be between 1 and 999");
    });

    it("rejects negative streak", async () => {
      await expect(
        profilesService.update("user-1", { streak: -1 })
      ).rejects.toThrow("streak must be between 0 and 99999");
    });

    it("allows valid update values", async () => {
      // Should not throw for valid values
      await profilesService.update("user-1", { xp: 500, level: 2 });
    });
  });

  describe("addXp", () => {
    it("rejects negative XP amount", async () => {
      await expect(
        profilesService.addXp("user-1", -100)
      ).rejects.toThrow("XP amount cannot be negative");
    });
  });

  describe("addCoins", () => {
    it("rejects negative coins amount", async () => {
      await expect(
        profilesService.addCoins("user-1", -50)
      ).rejects.toThrow("Coins amount cannot be negative");
    });
  });
});
