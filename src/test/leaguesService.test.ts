import { describe, it, expect, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }) }, from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnThis(), insert: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }), single: vi.fn().mockResolvedValue({ data: null, error: null }) }) } }));
vi.mock("@/services/loggingService", () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/authGuards", () => ({ requireAdminOrManager: vi.fn().mockResolvedValue({ id: "u1" }), requireAuth: vi.fn().mockResolvedValue({ id: "u1" }) }));

import { leaguesService } from "@/services/leaguesService";

describe("leaguesService", () => {
  it("getAll returns array", async () => {
    const r = await leaguesService.getAll();
    expect(Array.isArray(r)).toBe(true);
  });
});
