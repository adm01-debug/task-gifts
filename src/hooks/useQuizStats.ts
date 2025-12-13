import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizStatsService, CategoryStats } from "@/services/quizStatsService";

const statsKeys = {
  all: ['quiz-stats'] as const,
  categories: () => [...statsKeys.all, 'categories'] as const,
  question: (id: string) => [...statsKeys.all, 'question', id] as const,
};

export function useCategoryStats() {
  return useQuery<CategoryStats[]>({
    queryKey: statsKeys.categories(),
    queryFn: () => quizStatsService.getCategoryStats(),
  });
}

export function useQuestionStats(questionId: string) {
  return useQuery({
    queryKey: statsKeys.question(questionId),
    queryFn: () => quizStatsService.getQuestionStats(questionId),
    enabled: !!questionId,
  });
}

export function useRecordAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quizStatsService.recordAnswer,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statsKeys.categories() });
      queryClient.invalidateQueries({ queryKey: statsKeys.question(variables.question_id) });
    },
  });
}
