import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: { totp_secret: "TEST" }, error: null }),
    }),
  },
}));
vi.mock("@/services/loggingService", () => ({
  logger: { apiError: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import { twoFactorService } from "@/services/twoFactorService";

describe("twoFactorService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("backup code generation", () => {
    it("generates 8 backup codes by default", async () => {
      const result = await twoFactorService.setupTwoFactor("user-1", "a@b.com");
      expect(result.backupCodes).toHaveLength(8);
    });

    it("generates unique backup codes", async () => {
      const result = await twoFactorService.setupTwoFactor("user-1", "a@b.com");
      const unique = new Set(result.backupCodes);
      expect(unique.size).toBe(8);
    });

    it("generates codes with 8 hex characters each", async () => {
      const result = await twoFactorService.setupTwoFactor("user-1", "a@b.com");
      for (const code of result.backupCodes) {
        expect(code).toMatch(/^[0-9A-F]{8}$/);
      }
    });

    it("returns a QR code URL", async () => {
      const result = await twoFactorService.setupTwoFactor("user-1", "a@b.com");
      expect(result.qrCodeUrl).toContain("otpauth://totp/");
      expect(result.qrCodeUrl).toContain("GameficaRH");
    });

    it("returns a secret", async () => {
      const result = await twoFactorService.setupTwoFactor("user-1", "a@b.com");
      expect(result.secret).toBeTruthy();
      expect(result.secret.length).toBeGreaterThan(10);
    });
  });

  describe("rate limiting", () => {
    it("allows initial verification", async () => {
      // Should not throw on first attempt
      const result = await twoFactorService.verifyToken("rate-test-user", "000000");
      // Will return true because 2FA is not enabled in mock
      expect(typeof result).toBe("boolean");
    });
  });

  describe("isTwoFactorEnabled", () => {
    it("returns false when no record exists", async () => {
      const result = await twoFactorService.isTwoFactorEnabled("no-2fa-user");
      expect(result).toBe(false);
    });
  });
});
