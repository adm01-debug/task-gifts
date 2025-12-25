import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { competencyMatrixService, type CompetencyGap } from "@/services/competencyMatrixService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useCompetencyMatrix = (positionId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const positionCompetenciesQuery = useQuery({
    queryKey: ['position-competencies', positionId],
    queryFn: () => competencyMatrixService.getPositionCompetencies(positionId!),
    enabled: !!positionId,
  });

  const userAssessmentsQuery = useQuery({
    queryKey: ['user-assessments', user?.id],
    queryFn: () => competencyMatrixService.getUserAssessments(user!.id),
    enabled: !!user?.id,
  });

  const setPositionCompetencyMutation = useMutation({
    mutationFn: (params: { positionId: string; competencyId: string; requiredLevel: number; weight?: number; isMandatory?: boolean }) =>
      competencyMatrixService.setPositionCompetency(params.positionId, params.competencyId, params.requiredLevel, params.weight, params.isMandatory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['position-competencies'] });
      toast.success('Competência configurada!');
    },
  });

  const createAssessmentMutation = useMutation({
    mutationFn: competencyMatrixService.createAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-assessments'] });
      toast.success('Avaliação registrada!');
    },
  });

  const calculateGaps = async (userId: string, posId: string): Promise<CompetencyGap[]> => {
    return competencyMatrixService.calculateGaps(userId, posId);
  };

  return {
    positionCompetencies: positionCompetenciesQuery.data || [],
    userAssessments: userAssessmentsQuery.data || [],
    isLoading: positionCompetenciesQuery.isLoading,
    setPositionCompetency: setPositionCompetencyMutation.mutate,
    createAssessment: createAssessmentMutation.mutate,
    calculateGaps,
    getTeamOverview: competencyMatrixService.getTeamCompetencyOverview,
  };
};
