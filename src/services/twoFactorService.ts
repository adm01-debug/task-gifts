import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggingService";
import * as OTPAuth from "otpauth";

export interface TwoFactorSettings {
  id: string;
  user_id: string;
  is_enabled: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TwoFactorSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

// Maximum verification attempts before temporary lockout
const MAX_VERIFY_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// In-memory rate limiter for 2FA verification (per userId)
const verifyAttempts = new Map<string, { count: number; lockedUntil: number }>();

class TwoFactorService {
  private generateSecret(): string {
    const secret = new OTPAuth.Secret({ size: 20 });
    return secret.base32;
  }

  /**
   * Generates cryptographically secure backup codes using Web Crypto API.
   * Each code is 8 hex characters (32 bits of entropy per code).
   */
  private generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    const bytes = new Uint8Array(count * 4); // 4 bytes per code
    crypto.getRandomValues(bytes);
    for (let i = 0; i < count; i++) {
      const offset = i * 4;
      const code = Array.from(bytes.slice(offset, offset + 4))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hashes a backup code using SHA-256 for secure storage.
   * Plaintext codes are only shown to the user once during setup.
   */
  private async hashBackupCode(code: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(code.toUpperCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  private async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map(code => this.hashBackupCode(code)));
  }

  /**
   * Checks rate limiting for 2FA verification attempts.
   * Prevents brute-force attacks on TOTP codes.
   */
  private checkRateLimit(userId: string): void {
    const record = verifyAttempts.get(userId);
    if (record) {
      if (record.lockedUntil > Date.now()) {
        const remainingMs = record.lockedUntil - Date.now();
        const remainingMin = Math.ceil(remainingMs / 60_000);
        throw new Error(`Muitas tentativas. Tente novamente em ${remainingMin} minuto(s).`);
      }
      if (record.lockedUntil <= Date.now() && record.count >= MAX_VERIFY_ATTEMPTS) {
        // Reset after lockout period
        verifyAttempts.delete(userId);
      }
    }
  }

  private recordVerifyAttempt(userId: string, success: boolean): void {
    if (success) {
      verifyAttempts.delete(userId);
      return;
    }
    const record = verifyAttempts.get(userId) || { count: 0, lockedUntil: 0 };
    record.count += 1;
    if (record.count >= MAX_VERIFY_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }
    verifyAttempts.set(userId, record);
  }

  async getSettings(userId: string): Promise<TwoFactorSettings | null> {
    const { data, error } = await supabase
      .from("user_two_factor")
      .select("id, user_id, is_enabled, verified_at, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logger.apiError('getSettings', error, 'twoFactorService');
      throw error;
    }

    return data;
  }

  async setupTwoFactor(userId: string, email: string): Promise<TwoFactorSetupData> {
    const secret = this.generateSecret();
    const backupCodes = this.generateBackupCodes();

    // Hash backup codes before storing - plaintext only returned to user once
    const hashedCodes = await this.hashBackupCodes(backupCodes);

    const totp = new OTPAuth.TOTP({
      issuer: "GameficaRH",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret,
    });

    const qrCodeUrl = totp.toString();

    // Check if record exists
    const existing = await this.getSettings(userId);

    if (existing) {
      const { error } = await supabase
        .from("user_two_factor")
        .update({
          totp_secret: secret,
          backup_codes: hashedCodes,
          is_enabled: false,
          verified_at: null,
        })
        .eq("user_id", userId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("user_two_factor")
        .insert({
          user_id: userId,
          totp_secret: secret,
          backup_codes: hashedCodes,
          is_enabled: false,
        });

      if (error) throw error;
    }

    // Return plaintext codes to user (only time they will see them)
    return { secret, qrCodeUrl, backupCodes };
  }

  async verifyAndEnable(userId: string, token: string): Promise<boolean> {
    this.checkRateLimit(userId);

    // Get the secret from database
    const { data, error } = await supabase
      .from("user_two_factor")
      .select("totp_secret")
      .eq("user_id", userId)
      .single();

    if (error || !data?.totp_secret) {
      throw new Error("2FA not configured");
    }

    const totp = new OTPAuth.TOTP({
      issuer: "GameficaRH",
      label: "user",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: data.totp_secret,
    });

    const delta = totp.validate({ token, window: 1 });

    if (delta === null) {
      this.recordVerifyAttempt(userId, false);
      return false;
    }

    this.recordVerifyAttempt(userId, true);

    // Enable 2FA
    const { error: updateError } = await supabase
      .from("user_two_factor")
      .update({
        is_enabled: true,
        verified_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) throw updateError;

    return true;
  }

  async verifyToken(userId: string, token: string): Promise<boolean> {
    this.checkRateLimit(userId);

    const { data, error } = await supabase
      .from("user_two_factor")
      .select("totp_secret, backup_codes, is_enabled")
      .eq("user_id", userId)
      .single();

    if (error || !data?.is_enabled) {
      return true; // 2FA not enabled, allow access
    }

    // Check if it's a backup code (compare hashed)
    const inputHash = await this.hashBackupCode(token);
    const matchIndex = data.backup_codes?.findIndex(
      (storedHash: string) => storedHash === inputHash
    ) ?? -1;

    if (matchIndex >= 0) {
      // Remove used backup code hash
      const newCodes = [...(data.backup_codes || [])];
      newCodes.splice(matchIndex, 1);
      await supabase
        .from("user_two_factor")
        .update({ backup_codes: newCodes })
        .eq("user_id", userId);
      this.recordVerifyAttempt(userId, true);
      return true;
    }

    // Verify TOTP
    const totp = new OTPAuth.TOTP({
      issuer: "GameficaRH",
      label: "user",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: data.totp_secret,
    });

    const delta = totp.validate({ token, window: 1 });
    const success = delta !== null;
    this.recordVerifyAttempt(userId, success);
    return success;
  }

  async disable(userId: string): Promise<void> {
    const { error } = await supabase
      .from("user_two_factor")
      .update({
        is_enabled: false,
        totp_secret: null,
        backup_codes: null,
        verified_at: null,
      })
      .eq("user_id", userId);

    if (error) throw error;
  }

  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("user_two_factor")
      .select("is_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logger.apiError('isEnabled', error, 'twoFactorService');
      return false;
    }

    return data?.is_enabled ?? false;
  }
}

export const twoFactorService = new TwoFactorService();
