import { supabase } from "@/integrations/supabase/client";
import { notificationsService } from "./notificationsService";
import { profilesService } from "./profilesService";
import { auditService } from "./auditService";
import { missionsService } from "./missionsService";

export interface KudosBadge {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  category: string;
  xp_value: number;
  created_at: string;
}

export interface Kudos {
  id: string;
  from_user_id: string;
  to_user_id: string;
  badge_id: string | null;
  message: string;
  is_public: boolean;
  created_at: string;
}

export interface KudosWithDetails extends Kudos {
  from_profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  to_profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  badge: KudosBadge | null;
}

export interface KudosInsert {
  from_user_id: string;
  to_user_id: string;
  badge_id?: string | null;
  message: string;
  is_public?: boolean;
}

export const kudosService = {
  // Badges
  async getBadges(): Promise<KudosBadge[]> {
    const { data, error } = await supabase
      .from("kudos_badges")
      .select("*")
      .order("category", { ascending: true });
    
    if (error) throw error;
    return (data ?? []) as KudosBadge[];
  },

  async getBadgeById(id: string): Promise<KudosBadge | null> {
    const { data, error } = await supabase
      .from("kudos_badges")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) throw error;
    return data as KudosBadge | null;
  },

  // Kudos
  async getRecentKudos(limit = 20): Promise<KudosWithDetails[]> {
    const { data, error } = await supabase
      .from("kudos")
      .select(`
        *,
        from_profile:profiles!kudos_from_user_id_fkey(id, display_name, avatar_url),
        to_profile:profiles!kudos_to_user_id_fkey(id, display_name, avatar_url),
        badge:kudos_badges(*)
      `)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      // Fallback without joins if FK not set up
      console.error("Error fetching kudos with joins:", error);
      const { data: simpleData, error: simpleError } = await supabase
        .from("kudos")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (simpleError) throw simpleError;
      return (simpleData ?? []).map(k => ({
        ...k,
        from_profile: null,
        to_profile: null,
        badge: null,
      })) as KudosWithDetails[];
    }
    
    return (data ?? []) as unknown as KudosWithDetails[];
  },

  async getKudosReceived(userId: string): Promise<KudosWithDetails[]> {
    const { data, error } = await supabase
      .from("kudos")
      .select("*")
      .eq("to_user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return (data ?? []).map(k => ({
      ...k,
      from_profile: null,
      to_profile: null,
      badge: null,
    })) as KudosWithDetails[];
  },

  async getKudosGiven(userId: string): Promise<KudosWithDetails[]> {
    const { data, error } = await supabase
      .from("kudos")
      .select("*")
      .eq("from_user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return (data ?? []).map(k => ({
      ...k,
      from_profile: null,
      to_profile: null,
      badge: null,
    })) as KudosWithDetails[];
  },

  async getKudosCount(userId: string): Promise<{ received: number; given: number }> {
    const [received, given] = await Promise.all([
      supabase
        .from("kudos")
        .select("*", { count: "exact", head: true })
        .eq("to_user_id", userId),
      supabase
        .from("kudos")
        .select("*", { count: "exact", head: true })
        .eq("from_user_id", userId),
    ]);
    
    return {
      received: received.count ?? 0,
      given: given.count ?? 0,
    };
  },

  async giveKudos(kudos: KudosInsert): Promise<Kudos> {
    const { data, error } = await supabase
      .from("kudos")
      .insert(kudos)
      .select()
      .single();
    
    if (error) throw error;

    // Get badge info if present
    let badgeName = "Reconhecimento";
    let xpValue = 25;
    
    if (kudos.badge_id) {
      const badge = await this.getBadgeById(kudos.badge_id);
      if (badge) {
        badgeName = badge.name;
        xpValue = badge.xp_value;
      }
    }

    // Get sender name for notification
    let senderName = "Um colega";
    try {
      const sender = await profilesService.getById(kudos.from_user_id);
      if (sender?.display_name) {
        senderName = sender.display_name;
      }
    } catch (e) {
      console.error("Failed to get sender name:", e);
    }

    // Audit kudos given and received
    try {
      await auditService.logKudosGiven(kudos.from_user_id, kudos.to_user_id, data.id, kudos.badge_id ?? undefined);
      await auditService.logKudosReceived(kudos.to_user_id, kudos.from_user_id, data.id, kudos.badge_id ?? undefined);
    } catch (e) {
      console.error("Failed to audit kudos:", e);
    }

    // Notify the recipient
    try {
      await notificationsService.create({
        user_id: kudos.to_user_id,
        type: "kudos",
        title: `🎉 ${senderName} te reconheceu!`,
        message: `Você recebeu: ${badgeName}`,
        data: { 
          fromUserId: kudos.from_user_id,
          badgeId: kudos.badge_id,
          message: kudos.message,
          xpValue,
        },
      });
    } catch (e) {
      console.error("Failed to create kudos notification:", e);
    }

    // Add XP to the recipient
    try {
      await profilesService.addXp(kudos.to_user_id, xpValue, `Kudos: ${badgeName}`);
    } catch (e) {
      console.error("Failed to add XP for kudos:", e);
    }

    // Auto-update mission progress for kudos given
    try {
      await missionsService.incrementByMetricKey(kudos.from_user_id, 'kudos_given', 1);
      await missionsService.incrementByMetricKey(kudos.to_user_id, 'kudos_received', 1);
    } catch (e) {
      console.error("Failed to update kudos mission progress:", e);
    }

    return data as Kudos;
  },

  async deleteKudos(id: string): Promise<void> {
    const { error } = await supabase
      .from("kudos")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },
};
