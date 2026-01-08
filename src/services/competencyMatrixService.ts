import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggingService";

export interface PositionCompetency {
  id: string;
  position_id: string;
  competency_id: string;
  required_level: number;
  weight: number;
  is_mandatory: boolean;
  created_at: string;
}

export interface UserCompetencyAssessment {
  id: string;
  user_id: string;
  competency_id: string;
  assessed_level: number;
  assessment_type: string;
  evidence?: string;
  assessor_id?: string;
  feedback_cycle_id?: string;
  valid_until?: string;
  created_at: string;
}

export interface CompetencyGap {
  competency_id: string;
  competency_name: string;
  required_level: number;
  current_level: number;
  gap: number;
  is_mandatory: boolean;
}

export const competencyMatrixService = {
  async getPositionCompetencies(positionId: string): Promise<PositionCompetency[]> {
    const { data, error } = await supabase.from('position_competencies').select('*').eq('position_id', positionId);
    if (error) { logger.error('Failed to fetch position competencies', 'CompetencyMatrix', error); throw error; }
    return (data || []) as unknown as PositionCompetency[];
  },

  async setPositionCompetency(positionId: string, competencyId: string, requiredLevel: number, weight: number = 1.0, isMandatory: boolean = true): Promise<PositionCompetency> {
    const { data, error } = await supabase.from('position_competencies').upsert({
      position_id: positionId,
      competency_id: competencyId,
      required_level: requiredLevel,
      weight,
      is_mandatory: isMandatory,
    }, { onConflict: 'position_id,competency_id' }).select().maybeSingle();
    if (error) { logger.error('Failed to set position competency', 'CompetencyMatrix', error); throw error; }
    if (!data) throw new Error('Failed to set position competency');
    return data as unknown as PositionCompetency;
  },

  async removePositionCompetency(positionId: string, competencyId: string): Promise<void> {
    const { error } = await supabase.from('position_competencies').delete().eq('position_id', positionId).eq('competency_id', competencyId);
    if (error) { logger.error('Failed to remove position competency', 'CompetencyMatrix', error); throw error; }
  },

  async getUserAssessments(userId: string): Promise<UserCompetencyAssessment[]> {
    const { data, error } = await supabase.from('user_competency_assessments').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) { logger.error('Failed to fetch user assessments', 'CompetencyMatrix', error); throw error; }
    return (data || []) as unknown as UserCompetencyAssessment[];
  },

  async getLatestAssessment(userId: string, competencyId: string): Promise<UserCompetencyAssessment | null> {
    const { data, error } = await supabase.from('user_competency_assessments').select('*').eq('user_id', userId).eq('competency_id', competencyId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) { logger.error('Failed to fetch latest assessment', 'CompetencyMatrix', error); return null; }
    return data as unknown as UserCompetencyAssessment | null;
  },

  async createAssessment(assessment: Omit<UserCompetencyAssessment, 'id' | 'created_at'>): Promise<UserCompetencyAssessment> {
    const { data, error } = await supabase.from('user_competency_assessments').insert(assessment).select().maybeSingle();
    if (error) { logger.error('Failed to create assessment', 'CompetencyMatrix', error); throw error; }
    if (!data) throw new Error('Failed to create assessment');
    return data as unknown as UserCompetencyAssessment;
  },

  async calculateGaps(userId: string, positionId: string): Promise<CompetencyGap[]> {
    const [positionCompetencies, userAssessments] = await Promise.all([
      this.getPositionCompetencies(positionId),
      this.getUserAssessments(userId),
    ]);

    const { data: competencies } = await supabase.from('competencies').select('id, name');

    const latestAssessments = new Map<string, number>();
    userAssessments.forEach(a => {
      if (!latestAssessments.has(a.competency_id)) {
        latestAssessments.set(a.competency_id, a.assessed_level);
      }
    });

    const competencyMap = new Map((competencies || []).map((c: { id: string; name: string }) => [c.id, c.name]));

    return positionCompetencies.map(pc => {
      const currentLevel = latestAssessments.get(pc.competency_id) || 0;
      return {
        competency_id: pc.competency_id,
        competency_name: competencyMap.get(pc.competency_id) || 'Unknown',
        required_level: pc.required_level,
        current_level: currentLevel,
        gap: pc.required_level - currentLevel,
        is_mandatory: pc.is_mandatory,
      };
    }).sort((a, b) => b.gap - a.gap);
  },

  async getTeamCompetencyOverview(departmentId: string): Promise<Array<{ competency_id: string; competency_name: string; avg_level: number; total_users: number }>> {
    const { data: assessments, error } = await supabase.from('user_competency_assessments').select('competency_id, assessed_level');
    if (error) { logger.error('Failed to fetch team assessments', 'CompetencyMatrix', error); throw error; }
    
    const { data: competencies } = await supabase.from('competencies').select('id, name');
    const competencyMap = new Map((competencies || []).map((c: { id: string; name: string }) => [c.id, c.name]));

    const grouped = new Map<string, { total: number; count: number }>();
    (assessments || []).forEach((a: { competency_id: string; assessed_level: number }) => {
      const existing = grouped.get(a.competency_id) || { total: 0, count: 0 };
      existing.total += a.assessed_level;
      existing.count += 1;
      grouped.set(a.competency_id, existing);
    });

    return Array.from(grouped.entries()).map(([id, data]) => ({
      competency_id: id,
      competency_name: competencyMap.get(id) || 'Unknown',
      avg_level: data.total / data.count,
      total_users: data.count,
    }));
  },
};
