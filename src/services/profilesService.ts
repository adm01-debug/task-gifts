import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { notificationsService } from "./notificationsService";
import { auditService } from "./auditService";
import { logger } from "./loggingService";

export type Profile = Tables<"profiles">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

// Public-safe columns (no PII like cpf, phone, personal_email)
const PUBLIC_PROFILE_COLUMNS = "id, display_name, avatar_url, level, xp, coins, streak, best_streak, quests_completed, status, created_at, updated_at, email, employee_id, hire_date, last_access_at, contract_type" as const;

// Validation constraints for profile fields
const PROFILE_CONSTRAINTS = {
  xp: { min: 0, max: 99_999_999 },
  coins: { min: 0, max: 99_999_999 },
  level: { min: 1, max: 999 },
  streak: { min: 0, max: 99_999 },
  best_streak: { min: 0, max: 99_999 },
  quests_completed: { min: 0, max: 99_999 },
} as const;

function validateProfileUpdate(updates: ProfileUpdate): void {
  for (const [field, constraints] of Object.entries(PROFILE_CONSTRAINTS)) {
    const value = (updates as Record<string, unknown>)[field];
    if (value !== undefined && typeof value === "number") {
      if (value < constraints.min || value > constraints.max) {
        throw new Error(`${field} must be between ${constraints.min} and ${constraints.max}, got ${value}`);
      }
    }
  }
}

export const profilesService = {
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select(PUBLIC_PROFILE_COLUMNS)
      .order("xp", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Profile[];
  },

  async getLeaderboard(limit = 10): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select(PUBLIC_PROFILE_COLUMNS)
      .order("xp", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as Profile[];
  },

  async update(id: string, updates: ProfileUpdate): Promise<Profile> {
    validateProfileUpdate(updates);

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Atomically adds XP using RPC to prevent race conditions.
   * Falls back to optimistic update if RPC is not available.
   */
  async addXp(id: string, xpAmount: number, source?: string): Promise<{ profile: Profile; leveledUp: boolean; newLevel?: number }> {
    if (xpAmount < 0) throw new Error("XP amount cannot be negative");

    // Attempt atomic RPC call first
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc("add_xp_atomic", { p_user_id: id, p_amount: xpAmount });

    let updatedProfile: Profile;
    let oldLevel: number;

    if (!rpcError && rpcResult) {
      // RPC succeeded - use atomic result
      oldLevel = rpcResult.old_level ?? 0;
      updatedProfile = await this.getById(id) as Profile;
      if (!updatedProfile) throw new Error("Profile not found after XP update");
    } else {
      // Fallback: use optimistic update with retry
      logger.warn("RPC add_xp_atomic unavailable, using fallback", "profilesService", rpcError);
      const profile = await this.getById(id);
      if (!profile) throw new Error("Profile not found");

      oldLevel = profile.level;
      const newXp = profile.xp + xpAmount;
      const newLevel = Math.floor(newXp / 1000) + 1;

      updatedProfile = await this.update(id, { xp: newXp, level: newLevel });
    }

    const newLevel = updatedProfile.level;
    const leveledUp = newLevel > oldLevel;

    // Audit XP gain - log warning on failure instead of silent swallow
    auditService.logXpGain(id, xpAmount, source || "atividade").catch((err) => {
      logger.warn("Failed to log XP gain audit", "profilesService", err);
    });

    // Create XP notification - log warning on failure
    notificationsService.notifyXpGain(id, xpAmount, source || "atividade").catch((err) => {
      logger.warn("Failed to send XP notification", "profilesService", err);
    });

    // Create level up notification and audit if leveled up
    if (leveledUp) {
      auditService.logLevelUp(id, oldLevel, newLevel).catch((err) => {
        logger.warn("Failed to log level-up audit", "profilesService", err);
      });
      notificationsService.notifyLevelUp(id, newLevel).catch((err) => {
        logger.warn("Failed to send level-up notification", "profilesService", err);
      });
    }

    return { profile: updatedProfile, leveledUp, newLevel: leveledUp ? newLevel : undefined };
  },

  /**
   * Atomically adds coins using RPC to prevent race conditions.
   */
  async addCoins(id: string, coinsAmount: number): Promise<Profile> {
    if (coinsAmount < 0) throw new Error("Coins amount cannot be negative");

    const { error: rpcError } = await supabase
      .rpc("add_coins_atomic", { p_user_id: id, p_amount: coinsAmount });

    if (!rpcError) {
      const profile = await this.getById(id);
      if (!profile) throw new Error("Profile not found after coins update");
      return profile;
    }

    // Fallback
    logger.warn("RPC add_coins_atomic unavailable, using fallback", "profilesService", rpcError);
    const profile = await this.getById(id);
    if (!profile) throw new Error("Profile not found");

    return this.update(id, { coins: profile.coins + coinsAmount });
  },

  /**
   * Atomically increments streak using RPC to prevent race conditions.
   */
  async incrementStreak(id: string): Promise<Profile> {
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc("increment_streak_atomic", { p_user_id: id });

    if (!rpcError && rpcResult) {
      const oldStreak = rpcResult.old_streak ?? 0;
      const newStreak = rpcResult.new_streak ?? oldStreak + 1;

      auditService.logStreakUpdate(id, oldStreak, newStreak).catch((err) => {
        logger.warn("Failed to log streak audit", "profilesService", err);
      });

      const profile = await this.getById(id);
      if (!profile) throw new Error("Profile not found after streak update");
      return profile;
    }

    // Fallback
    logger.warn("RPC increment_streak_atomic unavailable, using fallback", "profilesService", rpcError);
    const profile = await this.getById(id);
    if (!profile) throw new Error("Profile not found");

    const oldStreak = profile.streak;
    const newStreak = profile.streak + 1;
    const bestStreak = Math.max(profile.best_streak, newStreak);

    const updatedProfile = await this.update(id, {
      streak: newStreak,
      best_streak: bestStreak
    });

    auditService.logStreakUpdate(id, oldStreak, newStreak).catch((err) => {
      logger.warn("Failed to log streak audit", "profilesService", err);
    });

    return updatedProfile;
  },

  /**
   * Atomically increments quests completed using RPC.
   */
  async incrementQuestsCompleted(id: string): Promise<Profile> {
    const { error: rpcError } = await supabase
      .rpc("increment_quests_completed_atomic", { p_user_id: id });

    if (!rpcError) {
      const profile = await this.getById(id);
      if (!profile) throw new Error("Profile not found after quest update");
      return profile;
    }

    // Fallback
    logger.warn("RPC increment_quests_completed_atomic unavailable, using fallback", "profilesService", rpcError);
    const profile = await this.getById(id);
    if (!profile) throw new Error("Profile not found");

    return this.update(id, {
      quests_completed: profile.quests_completed + 1
    });
  },
};
