import { supabase } from "@/integrations/supabase/client";

export interface QuizAnswer {
  id: string;
  user_id: string;
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean;
  time_spent_ms: number;
  created_at: string;
}

export interface CategoryStats {
  category: string;
  total_answers: number;
  correct_answers: number;
  accuracy_rate: number;
  avg_time_ms: number;
  question_count: number;
}

export const quizStatsService = {
  async recordAnswer(data: {
    question_id: string;
    selected_option_id?: string;
    is_correct: boolean;
    time_spent_ms?: number;
  }): Promise<QuizAnswer | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: answer, error } = await supabase
      .from('quiz_answers')
      .insert({
        user_id: user.id,
        question_id: data.question_id,
        selected_option_id: data.selected_option_id || null,
        is_correct: data.is_correct,
        time_spent_ms: data.time_spent_ms || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording quiz answer:', error);
      return null;
    }

    return answer;
  },

  async getCategoryStats(): Promise<CategoryStats[]> {
    const { data, error } = await supabase.rpc('get_quiz_category_stats');

    if (error) {
      console.error('Error fetching category stats:', error);
      return [];
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      category: row.category as string,
      total_answers: Number(row.total_answers) || 0,
      correct_answers: Number(row.correct_answers) || 0,
      accuracy_rate: Number(row.accuracy_rate) || 0,
      avg_time_ms: Number(row.avg_time_ms) || 0,
      question_count: Number(row.question_count) || 0,
    }));
  },

  async getQuestionStats(questionId: string): Promise<{
    total: number;
    correct: number;
    rate: number;
  }> {
    const { data, error } = await supabase
      .from('quiz_answers')
      .select('is_correct')
      .eq('question_id', questionId);

    if (error) {
      console.error('Error fetching question stats:', error);
      return { total: 0, correct: 0, rate: 0 };
    }

    const total = data?.length || 0;
    const correct = data?.filter(a => a.is_correct).length || 0;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, rate };
  },
};
