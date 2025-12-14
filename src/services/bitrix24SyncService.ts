import { supabase } from "@/integrations/supabase/client";
import { completeTask } from "./bitrix24Service";

export const bitrix24SyncService = {
  /**
   * Check if a quest has a synced Bitrix24 task and complete it
   */
  async syncQuestCompletion(questId: string): Promise<boolean> {
    try {
      // Find sync mapping for this quest
      const { data: mapping, error } = await supabase
        .from("bitrix24_sync_mappings")
        .select("*")
        .eq("entity_type", "quest")
        .eq("local_id", questId)
        .eq("bitrix_entity_type", "task")
        .eq("sync_status", "synced")
        .maybeSingle();

      if (error) {
        console.error("Error checking Bitrix24 sync mapping:", error);
        return false;
      }

      if (!mapping) {
        console.log("No Bitrix24 task mapping found for quest:", questId);
        return false;
      }

      // Complete the task in Bitrix24
      await completeTask(mapping.bitrix_id);
      
      // Update sync mapping status
      await supabase
        .from("bitrix24_sync_mappings")
        .update({ 
          sync_status: "completed",
          last_synced_at: new Date().toISOString(),
          metadata: {
            ...((mapping.metadata as Record<string, unknown>) || {}),
            completed_at: new Date().toISOString()
          }
        })
        .eq("id", mapping.id);

      console.log("Bitrix24 task completed for quest:", questId, "task:", mapping.bitrix_id);
      return true;
    } catch (error) {
      console.error("Failed to sync quest completion with Bitrix24:", error);
      return false;
    }
  },

  /**
   * Create a sync mapping between a quest and a Bitrix24 task
   */
  async createQuestTaskMapping(questId: string, bitrixTaskId: string): Promise<void> {
    const { error } = await supabase
      .from("bitrix24_sync_mappings")
      .insert({
        entity_type: "quest",
        local_id: questId,
        bitrix_entity_type: "task",
        bitrix_id: bitrixTaskId,
        sync_status: "synced"
      });

    if (error) throw error;
  },

  /**
   * Get Bitrix24 task ID for a quest
   */
  async getQuestTaskMapping(questId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("bitrix24_sync_mappings")
      .select("bitrix_id")
      .eq("entity_type", "quest")
      .eq("local_id", questId)
      .eq("bitrix_entity_type", "task")
      .maybeSingle();

    if (error || !data) return null;
    return data.bitrix_id;
  }
};
