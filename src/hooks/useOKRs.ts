import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { okrService, type Objective, type KeyResult } from "@/services/okrService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useOKRs = (filters?: { 
  ownerId?: string; 
  departmentId?: string; 
  status?: string;
  cycleId?: string;
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const objectivesQuery = useQuery({
    queryKey: ['okr-objectives', filters],
    queryFn: () => okrService.getObjectives(filters),
  });

  const cyclesQuery = useQuery({
    queryKey: ['okr-cycles'],
    queryFn: () => okrService.getOKRCycles(),
  });

  const createObjectiveMutation = useMutation({
    mutationFn: (objective: Omit<Objective, 'id' | 'created_at' | 'updated_at' | 'progress'>) =>
      okrService.createObjective(objective),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-objectives'] });
      toast.success('Objetivo criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar objetivo');
    }
  });

  const updateObjectiveMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Objective> }) =>
      okrService.updateObjective(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-objectives'] });
      toast.success('Objetivo atualizado!');
    },
  });

  const deleteObjectiveMutation = useMutation({
    mutationFn: (id: string) => okrService.deleteObjective(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-objectives'] });
      toast.success('Objetivo removido');
    },
  });

  return {
    objectives: objectivesQuery.data || [],
    cycles: cyclesQuery.data || [],
    isLoading: objectivesQuery.isLoading,
    createObjective: createObjectiveMutation.mutate,
    updateObjective: updateObjectiveMutation.mutate,
    deleteObjective: deleteObjectiveMutation.mutate,
    isCreating: createObjectiveMutation.isPending,
  };
};

export const useKeyResults = (objectiveId: string) => {
  const queryClient = useQueryClient();

  const keyResultsQuery = useQuery({
    queryKey: ['okr-key-results', objectiveId],
    queryFn: () => okrService.getKeyResults(objectiveId),
    enabled: !!objectiveId,
  });

  const createKeyResultMutation = useMutation({
    mutationFn: (keyResult: Omit<KeyResult, 'id' | 'created_at' | 'updated_at' | 'status'>) =>
      okrService.createKeyResult(keyResult),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-key-results', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['okr-objectives'] });
      toast.success('Key Result adicionado!');
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, value, comment }: { id: string; value: number; comment?: string }) =>
      okrService.updateKeyResultProgress(id, value, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-key-results', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['okr-objectives'] });
      toast.success('Progresso atualizado! +15 XP');
    },
  });

  return {
    keyResults: keyResultsQuery.data || [],
    isLoading: keyResultsQuery.isLoading,
    createKeyResult: createKeyResultMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
  };
};

export const useObjective = (id: string) => {
  return useQuery({
    queryKey: ['okr-objective', id],
    queryFn: () => okrService.getObjectiveById(id),
    enabled: !!id,
  });
};
