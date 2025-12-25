import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggingService";

export interface DemographicAttribute {
  id: string;
  name: string;
  name_en?: string;
  name_es?: string;
  attribute_type: string;
  options?: Array<{ value: string; label: string }>;
  is_required: boolean;
  is_active: boolean;
  is_restricted: boolean;
  is_visible_in_reports: boolean;
  allow_prefer_not_answer: boolean;
  order_index: number;
}

export interface UserDemographicValue {
  id: string;
  user_id: string;
  attribute_id: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export const demographicsService = {
  async getAttributes(): Promise<DemographicAttribute[]> {
    const { data, error } = await supabase.from('demographic_attributes').select('*').eq('is_active', true).order('order_index');
    if (error) { logger.error('Failed to fetch attributes', 'Demographics', error); throw error; }
    return (data || []) as unknown as DemographicAttribute[];
  },

  async getAttributeById(id: string): Promise<DemographicAttribute | null> {
    const { data, error } = await supabase.from('demographic_attributes').select('*').eq('id', id).single();
    if (error) { logger.error('Failed to fetch attribute', 'Demographics', error); return null; }
    return data as unknown as DemographicAttribute;
  },

  async createAttribute(attribute: Omit<DemographicAttribute, 'id'>): Promise<DemographicAttribute> {
    const { data, error } = await supabase.from('demographic_attributes').insert(attribute).select().single();
    if (error) { logger.error('Failed to create attribute', 'Demographics', error); throw error; }
    return data as unknown as DemographicAttribute;
  },

  async updateAttribute(id: string, updates: Partial<DemographicAttribute>): Promise<DemographicAttribute> {
    const { data, error } = await supabase.from('demographic_attributes').update(updates).eq('id', id).select().single();
    if (error) { logger.error('Failed to update attribute', 'Demographics', error); throw error; }
    return data as unknown as DemographicAttribute;
  },

  async getUserValues(userId: string): Promise<UserDemographicValue[]> {
    const { data, error } = await supabase.from('user_demographic_values').select('*').eq('user_id', userId);
    if (error) { logger.error('Failed to fetch user values', 'Demographics', error); throw error; }
    return (data || []) as unknown as UserDemographicValue[];
  },

  async setUserValue(userId: string, attributeId: string, value: string): Promise<void> {
    const { error } = await supabase.from('user_demographic_values').upsert({
      user_id: userId,
      attribute_id: attributeId,
      value,
    }, { onConflict: 'user_id,attribute_id' });
    if (error) { logger.error('Failed to set user value', 'Demographics', error); throw error; }
  },

  async getUsersWithAttribute(attributeId: string, value?: string): Promise<string[]> {
    let query = supabase.from('user_demographic_values').select('user_id').eq('attribute_id', attributeId);
    if (value) query = query.eq('value', value);
    
    const { data, error } = await query;
    if (error) { logger.error('Failed to fetch users', 'Demographics', error); throw error; }
    return (data || []).map(d => d.user_id);
  },

  async getAttributeStats(attributeId: string): Promise<Array<{ value: string; count: number }>> {
    const { data, error } = await supabase.from('user_demographic_values').select('value').eq('attribute_id', attributeId);
    if (error) { logger.error('Failed to fetch stats', 'Demographics', error); throw error; }

    const counts = new Map<string, number>();
    (data || []).forEach(d => {
      counts.set(d.value, (counts.get(d.value) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
  },
};
