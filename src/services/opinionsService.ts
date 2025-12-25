import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggingService";

export type OpinionCategory = 'suggestion' | 'complaint' | 'compliment' | 'question' | 'other';
export type OpinionUrgency = 'low' | 'normal' | 'high';
export type OpinionStatus = 'new' | 'read' | 'in_progress' | 'resolved' | 'archived';

export interface Opinion {
  id: string;
  author_id: string;
  recipient_id: string | null;
  recipient_type: string;
  category: OpinionCategory;
  subject: string | null;
  content: string;
  urgency: OpinionUrgency;
  is_anonymous: boolean;
  status: OpinionStatus;
  read_at: string | null;
  resolved_at: string | null;
  department_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpinionResponse {
  id: string;
  opinion_id: string;
  responder_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface OpinionTag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export const opinionsService = {
  async getOpinions(filters?: {
    status?: OpinionStatus;
    category?: OpinionCategory;
    urgency?: OpinionUrgency;
    recipientId?: string;
    departmentId?: string;
  }): Promise<Opinion[]> {
    const { data, error } = await supabase
      .from('opinions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch opinions', 'OpinionsService', error);
      throw error;
    }
    
    let opinions = (data || []) as unknown as Opinion[];
    
    if (filters?.status) opinions = opinions.filter(o => o.status === filters.status);
    if (filters?.category) opinions = opinions.filter(o => o.category === filters.category);
    if (filters?.urgency) opinions = opinions.filter(o => o.urgency === filters.urgency);
    if (filters?.recipientId) opinions = opinions.filter(o => o.recipient_id === filters.recipientId);
    if (filters?.departmentId) opinions = opinions.filter(o => o.department_id === filters.departmentId);

    return opinions;
  },

  async getMyOpinions(userId: string): Promise<Opinion[]> {
    const { data, error } = await (supabase
      .from('opinions')
      .select('*') as any)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch my opinions', 'OpinionsService', error);
      throw error;
    }
    return (data || []) as Opinion[];
  },

  async getReceivedOpinions(userId: string): Promise<Opinion[]> {
    const { data, error } = await (supabase
      .from('opinions')
      .select('*') as any)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch received opinions', 'OpinionsService', error);
      throw error;
    }
    return (data || []) as Opinion[];
  },

  async createOpinion(opinion: {
    recipientId?: string;
    recipientType: string;
    category: OpinionCategory;
    subject?: string;
    content: string;
    urgency: OpinionUrgency;
    isAnonymous: boolean;
    departmentId?: string;
  }): Promise<Opinion> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('opinions')
      .insert({
        author_id: user.id,
        recipient_id: opinion.recipientId,
        recipient_type: opinion.recipientType,
        category: opinion.category,
        subject: opinion.subject,
        content: opinion.content,
        urgency: opinion.urgency,
        is_anonymous: opinion.isAnonymous,
        department_id: opinion.departmentId,
      } as any)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create opinion', 'OpinionsService', error);
      throw error;
    }
    return data as unknown as Opinion;
  },

  async updateOpinionStatus(id: string, status: OpinionStatus): Promise<Opinion> {
    const updates: any = { status };
    if (status === 'read') updates.read_at = new Date().toISOString();
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('opinions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update opinion status', 'OpinionsService', error);
      throw error;
    }
    return data as unknown as Opinion;
  },

  async getResponses(opinionId: string): Promise<OpinionResponse[]> {
    const { data, error } = await supabase
      .from('opinion_responses')
      .select('*')
      .eq('opinion_id', opinionId)
      .order('created_at');

    if (error) {
      logger.error('Failed to fetch opinion responses', 'OpinionsService', error);
      throw error;
    }
    return (data || []) as unknown as OpinionResponse[];
  },

  async addResponse(opinionId: string, content: string, isInternal: boolean = false): Promise<OpinionResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('opinion_responses')
      .insert({
        opinion_id: opinionId,
        responder_id: user.id,
        content,
        is_internal: isInternal,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to add opinion response', 'OpinionsService', error);
      throw error;
    }
    return data as unknown as OpinionResponse;
  },

  async getTags(): Promise<OpinionTag[]> {
    const { data, error } = await supabase
      .from('opinion_tags')
      .select('*')
      .order('name');

    if (error) {
      logger.error('Failed to fetch opinion tags', 'OpinionsService', error);
      throw error;
    }
    return (data || []) as unknown as OpinionTag[];
  },

  async getStats(departmentId?: string): Promise<{
    total: number;
    pending: number;
    resolved: number;
    avgResolutionDays: number;
    byCategory: Record<OpinionCategory, number>;
    byUrgency: Record<OpinionUrgency, number>;
  }> {
    const { data, error } = await (supabase
      .from('opinions')
      .select('*') as any);

    if (error) {
      logger.error('Failed to fetch opinion stats', 'OpinionsService', error);
      throw error;
    }

    let opinions = (data || []) as Opinion[];
    if (departmentId) opinions = opinions.filter(o => o.department_id === departmentId);
    const total = opinions.length;
    const pending = opinions.filter(o => o.status === 'new').length;
    const resolved = opinions.filter(o => o.status === 'resolved').length;

    const resolvedOpinions = opinions.filter(o => o.resolved_at);
    const avgResolutionDays = resolvedOpinions.length > 0
      ? resolvedOpinions.reduce((acc, o) => {
          const created = new Date(o.created_at);
          const resolved = new Date(o.resolved_at!);
          return acc + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / resolvedOpinions.length
      : 0;

    const byCategory = {
      suggestion: opinions.filter(o => o.category === 'suggestion').length,
      complaint: opinions.filter(o => o.category === 'complaint').length,
      compliment: opinions.filter(o => o.category === 'compliment').length,
      question: opinions.filter(o => o.category === 'question').length,
      other: opinions.filter(o => o.category === 'other').length,
    };

    const byUrgency = {
      low: opinions.filter(o => o.urgency === 'low').length,
      normal: opinions.filter(o => o.urgency === 'normal').length,
      high: opinions.filter(o => o.urgency === 'high').length,
    };

    return { total, pending, resolved, avgResolutionDays: Math.round(avgResolutionDays * 10) / 10, byCategory, byUrgency };
  },
};
