import { supabase } from "@/integrations/supabase/client";

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  xp_reward: number;
  coin_reward: number;
  rarity: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export const achievementsService = {
  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("category", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from("user_achievements")
      .select("*, achievement:achievements(*)")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async hasAchievement(userId: string, achievementKey: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("user_achievements")
      .select("id, achievements!inner(key)")
      .eq("user_id", userId)
      .eq("achievements.key", achievementKey)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async unlockAchievement(
    userId: string,
    achievementKey: string
  ): Promise<{ success: boolean; achievement?: Achievement; alreadyUnlocked?: boolean }> {
    // Check if already unlocked
    const hasIt = await this.hasAchievement(userId, achievementKey);
    if (hasIt) {
      return { success: false, alreadyUnlocked: true };
    }

    // Get achievement details
    const { data: achievement, error: achError } = await supabase
      .from("achievements")
      .select("*")
      .eq("key", achievementKey)
      .single();

    if (achError || !achievement) {
      console.error("Achievement not found:", achievementKey);
      return { success: false };
    }

    // Insert user achievement
    const { error: insertError } = await supabase
      .from("user_achievements")
      .insert({
        user_id: userId,
        achievement_id: achievement.id,
      });

    if (insertError) {
      console.error("Error unlocking achievement:", insertError);
      return { success: false };
    }

    // Award XP and coins - get current values first
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, coins")
      .eq("id", userId)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({
          xp: profile.xp + achievement.xp_reward,
          coins: profile.coins + achievement.coin_reward,
        })
        .eq("id", userId);
    }

    // Create notification
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "🏆 Conquista Desbloqueada!",
      message: `Você desbloqueou "${achievement.name}"! +${achievement.xp_reward} XP, +${achievement.coin_reward} moedas`,
      type: "achievement_unlocked",
      data: { achievementKey, achievementName: achievement.name },
    });

    return { success: true, achievement };
  },

  async checkComboAchievements(userId: string, multiplier: number): Promise<Achievement | null> {
    // Define thresholds
    const comboAchievements = [
      { multiplier: 2, key: "combo_primeira_chama" },
      { multiplier: 3, key: "combo_fogo_azul" },
      { multiplier: 4, key: "combo_inferno" },
    ];

    // Find highest applicable achievement
    const applicable = comboAchievements
      .filter((a) => multiplier >= a.multiplier)
      .sort((a, b) => b.multiplier - a.multiplier);

    if (applicable.length === 0) return null;

    // Try to unlock from highest to lowest
    for (const ach of applicable) {
      const result = await this.unlockAchievement(userId, ach.key);
      if (result.success && result.achievement) {
        return result.achievement;
      }
    }

    return null;
  },
};
