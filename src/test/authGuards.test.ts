import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before importing authGuards
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: mockFrom,
  },
}));

import { requireAuth, requireSelfOrAdmin, requireAdminOrManager, requireAdmin } from "@/lib/authGuards";

describe("authGuards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireAuth", () => {
    it("returns user when authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "a@b.com" } },
        error: null,
      });
      const user = await requireAuth();
      expect(user.id).toBe("user-1");
    });

    it("throws when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      await expect(requireAuth()).rejects.toThrow("Não autenticado");
    });

    it("throws on auth error", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Session expired"),
      });
      await expect(requireAuth()).rejects.toThrow("Não autenticado");
    });
  });

  describe("requireSelfOrAdmin", () => {
    it("allows user to access own resource", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });
      const user = await requireSelfOrAdmin("user-1");
      expect(user.id).toBe("user-1");
    });

    it("allows admin to access other user resource", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "admin-1" } },
        error: null,
      });

      const selectChain = {
        eq: vi.fn().mockResolvedValue({
          data: [{ role: "admin" }],
          error: null,
        }),
      };
      mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue(selectChain) });

      const user = await requireSelfOrAdmin("other-user");
      expect(user.id).toBe("admin-1");
    });

    it("rejects non-admin accessing other user", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const selectChain = {
        eq: vi.fn().mockResolvedValue({
          data: [{ role: "employee" }],
          error: null,
        }),
      };
      mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue(selectChain) });

      await expect(requireSelfOrAdmin("other-user")).rejects.toThrow("Sem permissão");
    });
  });

  describe("requireAdmin", () => {
    it("allows admin", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "admin-1" } },
        error: null,
      });

      const selectChain = {
        eq: vi.fn().mockResolvedValue({
          data: [{ role: "admin" }],
          error: null,
        }),
      };
      mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue(selectChain) });

      const user = await requireAdmin();
      expect(user.id).toBe("admin-1");
    });

    it("rejects non-admin", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const selectChain = {
        eq: vi.fn().mockResolvedValue({
          data: [{ role: "employee" }],
          error: null,
        }),
      };
      mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue(selectChain) });

      await expect(requireAdmin()).rejects.toThrow("Acesso restrito a administradores");
    });
  });

  describe("requireAdminOrManager", () => {
    it("allows manager", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "mgr-1" } },
        error: null,
      });

      const selectChain = {
        eq: vi.fn().mockResolvedValue({
          data: [{ role: "manager" }],
          error: null,
        }),
      };
      mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue(selectChain) });

      const user = await requireAdminOrManager();
      expect(user.id).toBe("mgr-1");
    });

    it("rejects employee", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "emp-1" } },
        error: null,
      });

      const selectChain = {
        eq: vi.fn().mockResolvedValue({
          data: [{ role: "employee" }],
          error: null,
        }),
      };
      mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue(selectChain) });

      await expect(requireAdminOrManager()).rejects.toThrow("Acesso restrito");
    });
  });
});
