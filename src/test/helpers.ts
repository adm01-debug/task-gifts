/**
 * Shared mock factory for service tests.
 * Usage: import { mockAll } from "./helpers";  then call mockAll() at top of test.
 */
import { vi } from "vitest";

export function mockAll() {
  vi.mock("@/integrations/supabase/client", () => ({
    supabase: {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
      channel: vi.fn().mockReturnValue({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() }),
      removeChannel: vi.fn(),
    },
  }));
  vi.mock("@/services/loggingService", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), apiError: vi.fn() } }));
  vi.mock("@/services/auditService", () => ({ auditService: { log: vi.fn().mockResolvedValue(undefined), logXpGain: vi.fn().mockResolvedValue(undefined), logLevelUp: vi.fn().mockResolvedValue(undefined), logStreakUpdate: vi.fn().mockResolvedValue(undefined) } }));
  vi.mock("@/services/notificationsService", () => ({ notificationsService: { create: vi.fn(), notifyXpGain: vi.fn().mockResolvedValue(undefined), notifyLevelUp: vi.fn().mockResolvedValue(undefined) } }));
  vi.mock("@/services/profilesService", () => ({ profilesService: { getById: vi.fn().mockResolvedValue({ id: "u1", xp: 100, coins: 500, level: 1, streak: 3 }), addXp: vi.fn().mockResolvedValue({ profile: {}, leveledUp: false }), addCoins: vi.fn().mockResolvedValue({}), incrementStreak: vi.fn().mockResolvedValue({}), incrementQuestsCompleted: vi.fn().mockResolvedValue({}) } }));
  vi.mock("@/services/achievementsService", () => ({ achievementsService: { checkAndUnlock: vi.fn(), unlockAchievement: vi.fn() } }));
  vi.mock("@/lib/authGuards", () => ({
    requireAuth: vi.fn().mockResolvedValue({ id: "u1" }),
    requireAdmin: vi.fn().mockResolvedValue({ id: "u1" }),
    requireAdminOrManager: vi.fn().mockResolvedValue({ id: "u1" }),
    requireSelfOrAdmin: vi.fn().mockResolvedValue({ id: "u1" }),
  }));
}
