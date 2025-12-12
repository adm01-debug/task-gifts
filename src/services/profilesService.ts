import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

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

  async addXp(id: string, xpAmount: number): Promise<Profile> {
    const profile = await this.getById(id);
    if (!profile) throw new Error("Profile not found");

    const newXp = profile.xp + xpAmount;
    const newLevel = Math.floor(newXp / 1000) + 1;

    return this.update(id, { 
      xp: newXp, 
      level: newLevel 
    });
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
};
