import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { opinionsService, Opinion, OpinionStatus, OpinionCategory, OpinionUrgency } from "@/services/opinionsService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useOpinions(filters?: {
  status?: OpinionStatus;
  category?: OpinionCategory;
  urgency?: OpinionUrgency;
  recipientId?: string;
  departmentId?: string;
}) {
  return useQuery({
    queryKey: ['opinions', filters],
    queryFn: () => opinionsService.getOpinions(filters),
  });
}

export function useMyOpinions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-opinions', user?.id],
    queryFn: () => opinionsService.getMyOpinions(user!.id),
    enabled: !!user?.id,
  });
}

export function useReceivedOpinions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['received-opinions', user?.id],
    queryFn: () => opinionsService.getReceivedOpinions(user!.id),
    enabled: !!user?.id,
  });
}

export function useOpinionResponses(opinionId: string) {
  return useQuery({
    queryKey: ['opinion-responses', opinionId],
    queryFn: () => opinionsService.getResponses(opinionId),
    enabled: !!opinionId,
  });
}

export function useOpinionTags() {
  return useQuery({
    queryKey: ['opinion-tags'],
    queryFn: () => opinionsService.getTags(),
  });
}

export function useOpinionStats(departmentId?: string) {
  return useQuery({
    queryKey: ['opinion-stats', departmentId],
    queryFn: () => opinionsService.getStats(departmentId),
  });
}

export function useCreateOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opinion: {
      recipientId?: string;
      recipientType: string;
      category: OpinionCategory;
      subject?: string;
      content: string;
      urgency: OpinionUrgency;
      isAnonymous: boolean;
      departmentId?: string;
    }) => opinionsService.createOpinion(opinion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opinions'] });
      queryClient.invalidateQueries({ queryKey: ['my-opinions'] });
      queryClient.invalidateQueries({ queryKey: ['opinion-stats'] });
      toast.success('Opinião enviada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao enviar opinião');
    },
  });
}

export function useUpdateOpinionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OpinionStatus }) =>
      opinionsService.updateOpinionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opinions'] });
      queryClient.invalidateQueries({ queryKey: ['received-opinions'] });
      queryClient.invalidateQueries({ queryKey: ['opinion-stats'] });
      toast.success('Status atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });
}

export function useAddOpinionResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opinionId, content, isInternal }: {
      opinionId: string;
      content: string;
      isInternal?: boolean;
    }) => opinionsService.addResponse(opinionId, content, isInternal),
    onSuccess: (_, { opinionId }) => {
      queryClient.invalidateQueries({ queryKey: ['opinion-responses', opinionId] });
      toast.success('Resposta adicionada!');
    },
    onError: () => {
      toast.error('Erro ao adicionar resposta');
    },
  });
}
