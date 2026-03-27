import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "unavailable" } }),
  },
}));
vi.mock("@/services/profilesService", () => ({
  profilesService: { getById: vi.fn().mockResolvedValue({ id: "u1", coins: 50 }) },
}));
vi.mock("@/services/notificationsService", () => ({ notificationsService: { create: vi.fn() } }));
vi.mock("@/services/auditService", () => ({ auditService: { log: vi.fn().mockResolvedValue(undefined) } }));
vi.mock("@/services/loggingService", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock("@/lib/authGuards", () => ({
  requireAuth: vi.fn().mockResolvedValue({ id: "u1" }),
  requireAdminOrManager: vi.fn().mockResolvedValue({ id: "u1" }),
}));

import { shopService } from "@/services/shopService";

describe("shopService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("purchaseReward validation", () => {
    it("rejects quantity 0", async () => {
      await expect(shopService.purchaseReward("u1", "r1", 0)).rejects.toThrow("Quantidade");
    });

    it("rejects negative quantity", async () => {
      await expect(shopService.purchaseReward("u1", "r1", -5)).rejects.toThrow("Quantidade");
    });

    it("rejects quantity over 100", async () => {
      await expect(shopService.purchaseReward("u1", "r1", 101)).rejects.toThrow("Quantidade");
    });

    it("accepts valid quantity", async () => {
      // Will fail at RPC level but passes validation
      await expect(shopService.purchaseReward("u1", "r1", 1)).rejects.not.toThrow("Quantidade");
    });
  });
});
