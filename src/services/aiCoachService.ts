import { supabase } from "@/integrations/supabase/client";
import { requireAuth } from "@/lib/authGuards";

export interface AICoachMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export const aiCoachService = {
  async getMessages(userId: string, limit = 50): Promise<AICoachMessage[]> {
    const { data, error } = await supabase
      .from("ai_coach_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      return [];
    }

    return (data || []) as AICoachMessage[];
  },

  async saveMessage(userId: string, role: "user" | "assistant", content: string): Promise<AICoachMessage | null> {
    const { data, error } = await supabase
      .from("ai_coach_messages")
      .insert({ user_id: userId, role, content })
      .select()
      .single();

    if (error) {
      return null;
    }

    return data as AICoachMessage;
  },

  async clearHistory(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from("ai_coach_messages")
      .delete()
      .eq("user_id", userId);

    if (error) {
      return false;
    }

    return true;
  },
};
