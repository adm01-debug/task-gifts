import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";
import { notificationsService } from "./notificationsService";

export type Quest = Tables<"custom_quests">;
export type QuestInsert = TablesInsert<"custom_quests">;
export type QuestUpdate = TablesUpdate<"custom_quests">;
export type QuestStep = Tables<"quest_steps">;
export type QuestStepInsert = TablesInsert<"quest_steps">;
export type QuestAssignment = Tables<"quest_assignments">;
export type QuestStatus = Enums<"quest_status">;
export type QuestDifficulty = Enums<"quest_difficulty">;

export interface QuestWithSteps extends Quest {
  quest_steps: QuestStep[];
}

export const questsService = {
  // Quests CRUD
  async getAll(status?: QuestStatus): Promise<Quest[]> {
    let query = supabase.from("custom_quests").select("*");
    
    if (status) {
      query = query.eq("status", status);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<QuestWithSteps | null> {
    const { data, error } = await supabase
      .from("custom_quests")
      .select("*, quest_steps(*)")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByCreator(creatorId: string): Promise<Quest[]> {
    const { data, error } = await supabase
      .from("custom_quests")
      .select("*")
      .eq("created_by", creatorId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  },

  async create(quest: QuestInsert): Promise<Quest> {
    const { data, error } = await supabase
      .from("custom_quests")
      .insert(quest)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: QuestUpdate): Promise<Quest> {
    const { data, error } = await supabase
      .from("custom_quests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("custom_quests")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },

  async archive(id: string): Promise<Quest> {
    return this.update(id, { status: "archived" });
  },

  async activate(id: string): Promise<Quest> {
    return this.update(id, { status: "active" });
  },

  // Quest Steps
  async getSteps(questId: string): Promise<QuestStep[]> {
    const { data, error } = await supabase
      .from("quest_steps")
      .select("*")
      .eq("quest_id", questId)
      .order("order_index", { ascending: true });
    
    if (error) throw error;
    return data ?? [];
  },

  async createStep(step: QuestStepInsert): Promise<QuestStep> {
    const { data, error } = await supabase
      .from("quest_steps")
      .insert(step)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createSteps(steps: QuestStepInsert[]): Promise<QuestStep[]> {
    const { data, error } = await supabase
      .from("quest_steps")
      .insert(steps)
      .select();
    
    if (error) throw error;
    return data ?? [];
  },

  async deleteSteps(questId: string): Promise<void> {
    const { error } = await supabase
      .from("quest_steps")
      .delete()
      .eq("quest_id", questId);
    
    if (error) throw error;
  },

  // Quest Assignments
  async getAssignments(questId: string): Promise<QuestAssignment[]> {
    const { data, error } = await supabase
      .from("quest_assignments")
      .select("*")
      .eq("quest_id", questId);
    
    if (error) throw error;
    return data ?? [];
  },

  async getUserAssignments(userId: string): Promise<QuestAssignment[]> {
    const { data, error } = await supabase
      .from("quest_assignments")
      .select("*")
      .eq("user_id", userId);
    
    if (error) throw error;
    return data ?? [];
  },

  async assignQuest(questId: string, userId: string): Promise<QuestAssignment> {
    const { data, error } = await supabase
      .from("quest_assignments")
      .insert({ quest_id: questId, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;

    // Get quest details for notification
    try {
      const quest = await this.getById(questId);
      if (quest) {
        await notificationsService.notifyQuestAssigned(userId, quest.title, questId);
      }
    } catch (e) {
      console.error("Failed to create quest assignment notification:", e);
    }

    return data;
  },

  async updateProgress(assignmentId: string, currentStep: number): Promise<QuestAssignment> {
    const { data, error } = await supabase
      .from("quest_assignments")
      .update({ current_step: currentStep })
      .eq("id", assignmentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async completeQuest(assignmentId: string): Promise<{ assignment: QuestAssignment; quest: Quest | null }> {
    const { data, error } = await supabase
      .from("quest_assignments")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", assignmentId)
      .select()
      .single();
    
    if (error) throw error;

    // Get quest details for notification
    let quest: Quest | null = null;
    try {
      quest = await this.getById(data.quest_id);
      if (quest) {
        await notificationsService.create({
          user_id: data.user_id,
          type: "quest_complete",
          title: "🎉 Quest Completada!",
          message: `Você finalizou: ${quest.title}`,
          data: { 
            questId: quest.id, 
            questTitle: quest.title,
            xpReward: quest.xp_reward,
            coinReward: quest.coin_reward
          },
        });
      }
    } catch (e) {
      console.error("Failed to create quest completion notification:", e);
    }

    return { assignment: data, quest };
  },

  // Stats
  async getQuestStats(questId: string): Promise<{
    totalAssigned: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  }> {
    const assignments = await this.getAssignments(questId);
    const completed = assignments.filter(a => a.completed_at !== null).length;
    const inProgress = assignments.filter(a => a.completed_at === null).length;
    
    return {
      totalAssigned: assignments.length,
      completed,
      inProgress,
      completionRate: assignments.length > 0 ? (completed / assignments.length) * 100 : 0,
    };
  },
};
