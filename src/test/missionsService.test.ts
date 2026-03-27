import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));
vi.mock("@/services/loggingService", () => ({ logger: { warn: vi.fn(), error: vi.fn(), apiError: vi.fn() } }));
vi.mock("@/services/profilesService", () => ({ profilesService: { addXp: vi.fn(), addCoins: vi.fn() } }));
vi.mock("@/services/auditService", () => ({ auditService: { log: vi.fn() } }));
vi.mock("@/lib/authGuards", () => ({
  requireAuth: vi.fn().mockResolvedValue({ id: "u1" }),
}));

import { missionsService } from "@/services/missionsService";

describe("missionsService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("claimReward", () => {
    it("throws when progress not found or unauthorized", async () => {
      await expect(missionsService.claimReward("u1", "bad-progress-id"))
        .rejects.toThrow("Progress not found or unauthorized");
    });
  });

  describe("getActiveMissions", () => {
    it("returns empty array when no missions", async () => {
      const result = await missionsService.getActiveMissions("dept-1");
      expect(result).toEqual([]);
    });
  });
});
