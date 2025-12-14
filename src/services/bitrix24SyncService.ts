import { supabase } from "@/integrations/supabase/client";
import { completeTask, getBitrixUsers, type Bitrix24User } from "./bitrix24Service";

export interface UserSyncResult {
  synced: number;
  created: number;
  updated: number;
  errors: string[];
}

export const bitrix24SyncService = {
  /**
   * Check if a quest has a synced Bitrix24 task and complete it
   */
  async syncQuestCompletion(questId: string): Promise<boolean> {
    try {
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

      await completeTask(mapping.bitrix_id);
      
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
   * Sync Bitrix24 users with local profiles
   */
  async syncUsers(): Promise<UserSyncResult> {
    const result: UserSyncResult = { synced: 0, created: 0, updated: 0, errors: [] };

    try {
      // Fetch users from Bitrix24
      const bitrixUsers = await getBitrixUsers();
      
      if (!bitrixUsers || bitrixUsers.length === 0) {
        result.errors.push("Nenhum usuário encontrado no Bitrix24");
        return result;
      }

      // Get existing sync mappings
      const { data: existingMappings } = await supabase
        .from("bitrix24_sync_mappings")
        .select("*")
        .eq("entity_type", "profile")
        .eq("bitrix_entity_type", "user");

      const mappingsByBitrixId = new Map(
        (existingMappings || []).map(m => [m.bitrix_id, m])
      );

      // Get all local profiles by email for matching
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, display_name");

      const profilesByEmail = new Map(
        (profiles || []).filter(p => p.email).map(p => [p.email!.toLowerCase(), p])
      );

      for (const bitrixUser of bitrixUsers) {
        try {
          const email = bitrixUser.EMAIL?.toLowerCase();
          const existingMapping = mappingsByBitrixId.get(bitrixUser.ID);

          if (existingMapping) {
            // Update existing mapping metadata
            await supabase
              .from("bitrix24_sync_mappings")
              .update({
                last_synced_at: new Date().toISOString(),
                metadata: {
                  name: bitrixUser.NAME,
                  last_name: bitrixUser.LAST_NAME,
                  email: bitrixUser.EMAIL,
                  position: bitrixUser.WORK_POSITION,
                  departments: bitrixUser.UF_DEPARTMENT,
                  active: bitrixUser.ACTIVE
                }
              })
              .eq("id", existingMapping.id);
            
            result.updated++;
          } else if (email && profilesByEmail.has(email)) {
            // Match by email - create new mapping
            const profile = profilesByEmail.get(email)!;
            
            await supabase
              .from("bitrix24_sync_mappings")
              .insert({
                entity_type: "profile",
                local_id: profile.id,
                bitrix_entity_type: "user",
                bitrix_id: bitrixUser.ID,
                sync_status: "synced",
                last_synced_at: new Date().toISOString(),
                metadata: {
                  name: bitrixUser.NAME,
                  last_name: bitrixUser.LAST_NAME,
                  email: bitrixUser.EMAIL,
                  position: bitrixUser.WORK_POSITION,
                  departments: bitrixUser.UF_DEPARTMENT,
                  active: bitrixUser.ACTIVE
                }
              });

            result.created++;
          }

          result.synced++;
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : "Erro desconhecido";
          result.errors.push(`Usuário ${bitrixUser.ID}: ${errorMsg}`);
        }
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
      result.errors.push(`Erro geral: ${errorMsg}`);
      return result;
    }
  },

  /**
   * Get user mapping by local profile ID
   */
  async getUserMappingByProfileId(profileId: string) {
    const { data, error } = await supabase
      .from("bitrix24_sync_mappings")
      .select("*")
      .eq("entity_type", "profile")
      .eq("local_id", profileId)
      .eq("bitrix_entity_type", "user")
      .maybeSingle();

    if (error) return null;
    return data;
  },

  /**
   * Get user mapping by Bitrix24 user ID
   */
  async getUserMappingByBitrixId(bitrixUserId: string) {
    const { data, error } = await supabase
      .from("bitrix24_sync_mappings")
      .select("*")
      .eq("bitrix_entity_type", "user")
      .eq("bitrix_id", bitrixUserId)
      .maybeSingle();

    if (error) return null;
    return data;
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
  },

  /**
   * Get all user sync mappings
   */
  async getAllUserMappings() {
    const { data, error } = await supabase
      .from("bitrix24_sync_mappings")
      .select("*")
      .eq("entity_type", "profile")
      .eq("bitrix_entity_type", "user")
      .order("last_synced_at", { ascending: false });

    if (error) return [];
    return data;
  }
};
