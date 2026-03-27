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
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));
vi.mock("@/services/loggingService", () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/profilesService", () => ({ profilesService: { addXp: vi.fn(), addCoins: vi.fn() } }));
vi.mock("@/services/auditService", () => ({ auditService: { log: vi.fn() } }));
vi.mock("@/lib/authGuards", () => ({
  requireAdminOrManager: vi.fn().mockResolvedValue({ id: "u1" }),
  requireAuth: vi.fn().mockResolvedValue({ id: "u1" }),
}));

import { seasonalEventsService } from "@/services/seasonalEventsService";

describe("seasonalEventsService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("incrementProgress validation", () => {
    it("rejects zero amount", async () => {
      await expect(seasonalEventsService.incrementProgress("u1", "c1", 0)).rejects.toThrow("Invalid amount");
    });

    it("rejects negative amount", async () => {
      await expect(seasonalEventsService.incrementProgress("u1", "c1", -5)).rejects.toThrow("Invalid amount");
    });

    it("rejects amount over 10000", async () => {
      await expect(seasonalEventsService.incrementProgress("u1", "c1", 10001)).rejects.toThrow("Invalid amount");
    });

    it("accepts valid amount (returns early if challenge not found)", async () => {
      // Challenge not found in mock, so it returns void silently
      await expect(seasonalEventsService.incrementProgress("u1", "c1", 5)).resolves.toBeUndefined();
    });
  });
});
