import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizQuestionsService, QuizQuestion, CreateQuestionData, UpdateQuestionData } from "@/services/quizQuestionsService";

const questionKeys = {
  all: ['quiz-questions'] as const,
  list: (filters?: Record<string, unknown>) => [...questionKeys.all, 'list', filters] as const,
  detail: (id: string) => [...questionKeys.all, 'detail', id] as const,
  withOptions: (filters?: Record<string, unknown>) => [...questionKeys.all, 'with-options', filters] as const,
};

export function useQuizQuestions(filters?: { 
  quiz_type?: string; 
  department_id?: string;
  is_active?: boolean;
}) {
  return useQuery<QuizQuestion[]>({
    queryKey: questionKeys.list(filters),
    queryFn: () => quizQuestionsService.getQuestions(filters),
  });
}

export function useQuizQuestionsWithOptions(filters?: { 
  quiz_type?: string; 
  is_active?: boolean;
  limit?: number;
}) {
  return useQuery<QuizQuestion[]>({
    queryKey: questionKeys.withOptions(filters),
    queryFn: () => quizQuestionsService.getQuestionsWithOptions(filters),
  });
}

export function useQuizQuestion(questionId: string) {
  return useQuery<QuizQuestion | null>({
    queryKey: questionKeys.detail(questionId),
    queryFn: () => quizQuestionsService.getQuestionWithOptions(questionId),
    enabled: !!questionId,
  });
}

export function useCreateQuizQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuestionData) => quizQuestionsService.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.all });
    },
  });
}

export function useUpdateQuizQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuestionData }) => 
      quizQuestionsService.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.all });
    },
  });
}

export function useDeleteQuizQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => quizQuestionsService.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.all });
    },
  });
}

export function useToggleQuizQuestionActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      quizQuestionsService.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.all });
    },
  });
}
