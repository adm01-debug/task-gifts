import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggingService";
import type { ClimatePillar } from "./climateSurveyService";

export interface ActionPlan {
  id: string;
  title: string;
  description: string | null;
  pillar: ClimatePillar | null;
  initial_score: number | null;
  target_score: number | null;
  current_score: number | null;
  status: string;
  owner_id: string;
  reviewer_id: string | null;
  department_id: string | null;
  related_survey_id: string | null;
  target_date: string;
  progress_percent: number;
  root_causes: any;
  root_cause_summary: string | null;
  xp_reward: number;
  coin_reward: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionPlanItem {
  id: string;
  plan_id: string;
  what_title: string;
  what_description: string | null;
  why_reason: string | null;
  where_location: string | null;
  when_start: string | null;
  when_end: string | null;
  who_responsible_id: string;
  who_participants: any | null;
  how_method: string | null;
  how_much_cost: number | null;
  how_much_currency: string | null;
  status: string;
  priority: string;
  progress_percent: number;
  order_index: number;
  impact_score: number | null;
  impact_notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionPlanUpdate {
  id: string;
  plan_id: string;
  user_id: string;
  update_type: string;
  old_value: string | null;
  new_value: string | null;
  comment: string | null;
  created_at: string;
}

export const actionPlanService = {
  async getPlans(filters?: {
    status?: string;
    ownerId?: string;
    departmentId?: string;
    pillar?: ClimatePillar;
  }): Promise<ActionPlan[]> {
    let query = supabase
      .from('action_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.ownerId) query = query.eq('owner_id', filters.ownerId);
    if (filters?.departmentId) query = query.eq('department_id', filters.departmentId);
    if (filters?.pillar) query = query.eq('pillar', filters.pillar);

    const { data, error } = await query;
    if (error) {
      logger.error('Failed to fetch action plans', 'ActionPlanService', error);
      throw error;
    }
    return (data || []) as unknown as ActionPlan[];
  },

  async getPlanById(id: string): Promise<ActionPlan | null> {
    const { data, error } = await supabase
      .from('action_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Failed to fetch action plan', 'ActionPlanService', error);
      throw error;
    }
    return data as unknown as ActionPlan;
  },

  async createPlan(plan: {
    title: string;
    description?: string;
    pillar?: ClimatePillar;
    initialScore?: number;
    targetScore?: number;
    targetDate: string;
    departmentId?: string;
    relatedSurveyId?: string;
    rootCauses?: string[];
    rootCauseSummary?: string;
  }): Promise<ActionPlan> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('action_plans')
      .insert({
        title: plan.title,
        description: plan.description,
        pillar: plan.pillar,
        initial_score: plan.initialScore,
        target_score: plan.targetScore,
        target_date: plan.targetDate,
        owner_id: user.id,
        department_id: plan.departmentId,
        related_survey_id: plan.relatedSurveyId,
        root_causes: plan.rootCauses || [],
        root_cause_summary: plan.rootCauseSummary,
      } as any)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create action plan', 'ActionPlanService', error);
      throw error;
    }
    return data as unknown as ActionPlan;
  },

  async updatePlan(id: string, updates: Partial<ActionPlan>): Promise<ActionPlan> {
    const { data, error } = await supabase
      .from('action_plans')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update action plan', 'ActionPlanService', error);
      throw error;
    }
    return data as unknown as ActionPlan;
  },

  async getItems(planId: string): Promise<ActionPlanItem[]> {
    const { data, error } = await supabase
      .from('action_plan_items')
      .select('*')
      .eq('plan_id', planId)
      .order('order_index');

    if (error) {
      logger.error('Failed to fetch action plan items', 'ActionPlanService', error);
      throw error;
    }
    return (data || []) as unknown as ActionPlanItem[];
  },

  async createItem(item: {
    planId: string;
    whatTitle: string;
    whatDescription?: string;
    whyReason?: string;
    whereLocation?: string;
    whenStart?: string;
    whenEnd?: string;
    whoResponsibleId: string;
    whoParticipants?: string[];
    howMethod?: string;
    howMuchCost?: number;
    howMuchCurrency?: string;
    priority?: string;
  }): Promise<ActionPlanItem> {
    const { data: existingItems } = await supabase
      .from('action_plan_items')
      .select('order_index')
      .eq('plan_id', item.planId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextIndex = existingItems && existingItems.length > 0 ? existingItems[0].order_index + 1 : 0;

    const { data, error } = await supabase
      .from('action_plan_items')
      .insert({
        plan_id: item.planId,
        what_title: item.whatTitle,
        what_description: item.whatDescription,
        why_reason: item.whyReason,
        where_location: item.whereLocation,
        when_start: item.whenStart,
        when_end: item.whenEnd,
        who_responsible_id: item.whoResponsibleId,
        who_participants: item.whoParticipants,
        how_method: item.howMethod,
        how_much_cost: item.howMuchCost,
        how_much_currency: item.howMuchCurrency || 'BRL',
        priority: item.priority || 'medium',
        order_index: nextIndex,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create action plan item', 'ActionPlanService', error);
      throw error;
    }
    return data as unknown as ActionPlanItem;
  },

  async updateItem(id: string, updates: Partial<ActionPlanItem>): Promise<ActionPlanItem> {
    const { data, error } = await supabase
      .from('action_plan_items')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update action plan item', 'ActionPlanService', error);
      throw error;
    }
    return data as unknown as ActionPlanItem;
  },

  async addUpdate(planId: string, updateType: string, oldValue?: string, newValue?: string, comment?: string): Promise<ActionPlanUpdate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('action_plan_updates')
      .insert({
        plan_id: planId,
        user_id: user.id,
        update_type: updateType,
        old_value: oldValue,
        new_value: newValue,
        comment,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to add action plan update', 'ActionPlanService', error);
      throw error;
    }
    return data as unknown as ActionPlanUpdate;
  },

  async getUpdates(planId: string): Promise<ActionPlanUpdate[]> {
    const { data, error } = await supabase
      .from('action_plan_updates')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch action plan updates', 'ActionPlanService', error);
      throw error;
    }
    return (data || []) as unknown as ActionPlanUpdate[];
  },

  async calculateProgress(planId: string): Promise<number> {
    const items = await this.getItems(planId);
    if (items.length === 0) return 0;

    const totalProgress = items.reduce((acc, item) => acc + item.progress_percent, 0);
    return Math.round(totalProgress / items.length);
  },
};
