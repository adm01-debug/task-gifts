import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));
vi.mock("@/services/loggingService", () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/profilesService", () => ({
  profilesService: { getById: vi.fn(), addXp: vi.fn() },
}));
vi.mock("@/services/auditService", () => ({ auditService: { log: vi.fn() } }));
vi.mock("@/lib/authGuards", () => ({
  requireAuth: vi.fn().mockResolvedValue({ id: "u1" }),
}));

import { duelsService } from "@/services/duelsService";

describe("duelsService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("createDuel validation", () => {
    it("rejects self-duel", async () => {
      await expect(duelsService.createDuel("u1", "u1")).rejects.toThrow("consigo mesmo");
    });

    it("rejects zero duration", async () => {
      await expect(duelsService.createDuel("u1", "u2", 0)).rejects.toThrow("Duração");
    });

    it("rejects duration over 168 hours", async () => {
      await expect(duelsService.createDuel("u1", "u2", 169)).rejects.toThrow("Duração");
    });

    it("accepts valid duration", async () => {
      // Will fail at DB level but passes validation
      await expect(duelsService.createDuel("u1", "u2", 24)).rejects.not.toThrow("Duração");
    });
  });
});
