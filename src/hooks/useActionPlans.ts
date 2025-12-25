import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { actionPlanService, ActionPlan, ActionPlanItem } from "@/services/actionPlanService";
import { ClimatePillar } from "@/services/climateSurveyService";
import { toast } from "sonner";

export function useActionPlans(filters?: {
  status?: string;
  ownerId?: string;
  departmentId?: string;
  pillar?: ClimatePillar;
}) {
  return useQuery({
    queryKey: ['action-plans', filters],
    queryFn: () => actionPlanService.getPlans(filters),
  });
}

export function useActionPlan(id: string) {
  return useQuery({
    queryKey: ['action-plan', id],
    queryFn: () => actionPlanService.getPlanById(id),
    enabled: !!id,
  });
}

export function useActionPlanItems(planId: string) {
  return useQuery({
    queryKey: ['action-plan-items', planId],
    queryFn: () => actionPlanService.getItems(planId),
    enabled: !!planId,
  });
}

export function useActionPlanUpdates(planId: string) {
  return useQuery({
    queryKey: ['action-plan-updates', planId],
    queryFn: () => actionPlanService.getUpdates(planId),
    enabled: !!planId,
  });
}

export function useCreateActionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plan: {
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
    }) => actionPlanService.createPlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
      toast.success('Plano de ação criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar plano de ação');
    },
  });
}

export function useUpdateActionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ActionPlan> }) =>
      actionPlanService.updatePlan(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['action-plans'] });
      queryClient.invalidateQueries({ queryKey: ['action-plan', id] });
      toast.success('Plano atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar plano');
    },
  });
}

export function useCreateActionPlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: {
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
    }) => actionPlanService.createItem(item),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: ['action-plan-items', planId] });
      toast.success('Ação adicionada ao plano!');
    },
    onError: () => {
      toast.error('Erro ao adicionar ação');
    },
  });
}

export function useUpdateActionPlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, planId, updates }: { id: string; planId: string; updates: Partial<ActionPlanItem> }) =>
      actionPlanService.updateItem(id, updates),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: ['action-plan-items', planId] });
      toast.success('Ação atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar ação');
    },
  });
}

export function useAddActionPlanUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, updateType, oldValue, newValue, comment }: {
      planId: string;
      updateType: string;
      oldValue?: string;
      newValue?: string;
      comment?: string;
    }) => actionPlanService.addUpdate(planId, updateType, oldValue, newValue, comment),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: ['action-plan-updates', planId] });
    },
  });
}
