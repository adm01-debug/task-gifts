import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }) },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));
vi.mock("@/services/loggingService", () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/authGuards", () => ({
  requireAuth: vi.fn().mockResolvedValue({ id: "u1" }),
}));

import { kudosService } from "@/services/kudosService";

describe("kudosService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
  });

  describe("getKudosReceived", () => {
    it("queries kudos with profile joins", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });
      const result = await kudosService.getKudosReceived("user-1");
      expect(result).toEqual([]);
      expect(mockFrom).toHaveBeenCalledWith("kudos");
    });
  });

  describe("getKudosGiven", () => {
    it("returns empty array when no kudos", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });
      const result = await kudosService.getKudosGiven("user-1");
      expect(result).toEqual([]);
    });
  });

  describe("getKudosCount", () => {
    it("returns counts for received and given", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
        }),
      });
      const result = await kudosService.getKudosCount("user-1");
      expect(result).toHaveProperty("received");
      expect(result).toHaveProperty("given");
    });
  });
});
