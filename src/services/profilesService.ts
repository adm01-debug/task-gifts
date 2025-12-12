import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { notificationsService } from "./notificationsService";

export type Profile = Tables<"profiles">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

export const profilesService = {
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("xp", { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  },

  async getLeaderboard(limit = 10): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("xp", { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data ?? [];
  },

  async update(id: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addXp(id: string, xpAmount: number, source?: string): Promise<{ profile: Profile; leveledUp: boolean; newLevel?: number }> {
    const profile = await this.getById(id);
    if (!profile) throw new Error("Profile not found");

    const newXp = profile.xp + xpAmount;
    const oldLevel = profile.level;
    const newLevel = Math.floor(newXp / 1000) + 1;
    const leveledUp = newLevel > oldLevel;

    const updatedProfile = await this.update(id, { 
      xp: newXp, 
      level: newLevel 
    });

    // Create XP notification
    try {
      await notificationsService.notifyXpGain(id, xpAmount, source || "atividade");
    } catch (e) {
      console.error("Failed to create XP notification:", e);
    }

    // Create level up notification if leveled up
    if (leveledUp) {
      try {
        await notificationsService.notifyLevelUp(id, newLevel);
      } catch (e) {
        console.error("Failed to create level up notification:", e);
      }
    }

    return { profile: updatedProfile, leveledUp, newLevel: leveledUp ? newLevel : undefined };
  },

  async addCoins(id: string, coinsAmount: number): Promise<Profile> {
    const profile = await this.getById(id);
    if (!profile) throw new Error("Profile not found");

    return this.update(id, { 
      coins: profile.coins + coinsAmount 
    });
  },

  async incrementStreak(id: string): Promise<Profile> {
    const profile = await this.getById(id);
    if (!profile) throw new Error("Profile not found");

    const newStreak = profile.streak + 1;
    const bestStreak = Math.max(profile.best_streak, newStreak);

    return this.update(id, { 
      streak: newStreak,
      best_streak: bestStreak
    });
  },

  async incrementQuestsCompleted(id: string): Promise<Profile> {
    const profile = await this.getById(id);
    if (!profile) throw new Error("Profile not found");

    return this.update(id, { 
      quests_completed: profile.quests_completed + 1
    });
  },
};
