import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { passwordResetService } from "@/services/passwordResetService";
import { toast } from "sonner";

export function usePasswordResetRequests() {
  const queryClient = useQueryClient();

  // Minhas solicitações
  const myRequestsQuery = useQuery({
    queryKey: ["password-reset-my-requests"],
    queryFn: () => passwordResetService.getMyRequests(),
  });

  // Solicitações pendentes da equipe (gestor)
  const pendingTeamRequestsQuery = useQuery({
    queryKey: ["password-reset-pending-team"],
    queryFn: () => passwordResetService.getPendingTeamRequests(),
  });

  // Todas as solicitações (admin)
  const allRequestsQuery = useQuery({
    queryKey: ["password-reset-all"],
    queryFn: () => passwordResetService.getAllRequests(),
  });

  // Contagem de pendentes
  const pendingCountQuery = useQuery({
    queryKey: ["password-reset-pending-count"],
    queryFn: () => passwordResetService.getPendingCount(),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  // Verificar se tem solicitação pendente
  const hasPendingQuery = useQuery({
    queryKey: ["password-reset-has-pending"],
    queryFn: () => passwordResetService.hasPendingRequest(),
  });

  // Solicitar reset
  const requestResetMutation = useMutation({
    mutationFn: () => passwordResetService.requestPasswordReset(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["password-reset-my-requests"] });
      queryClient.invalidateQueries({ queryKey: ["password-reset-has-pending"] });
      toast.success("Solicitação enviada! Aguarde aprovação do seu gestor.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao solicitar reset de senha");
    },
  });

  // Aprovar solicitação
  const approveMutation = useMutation({
    mutationFn: ({ requestId, notes }: { requestId: string; notes?: string }) =>
      passwordResetService.approveRequest(requestId, notes),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["password-reset"] });
        toast.success("Solicitação aprovada! O usuário poderá redefinir a senha.");
      } else {
        toast.error(result.error || "Erro ao aprovar");
      }
    },
    onError: () => toast.error("Erro ao aprovar solicitação"),
  });

  // Rejeitar solicitação
  const rejectMutation = useMutation({
    mutationFn: ({ requestId, notes }: { requestId: string; notes?: string }) =>
      passwordResetService.rejectRequest(requestId, notes),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["password-reset"] });
        toast.success("Solicitação rejeitada");
      } else {
        toast.error(result.error || "Erro ao rejeitar");
      }
    },
    onError: () => toast.error("Erro ao rejeitar solicitação"),
  });

  return {
    myRequests: myRequestsQuery.data || [],
    pendingTeamRequests: pendingTeamRequestsQuery.data || [],
    allRequests: allRequestsQuery.data || [],
    pendingCount: pendingCountQuery.data || 0,
    hasPendingRequest: hasPendingQuery.data || false,
    isLoading: myRequestsQuery.isLoading || pendingTeamRequestsQuery.isLoading,
    requestReset: requestResetMutation.mutate,
    approveRequest: approveMutation.mutate,
    rejectRequest: rejectMutation.mutate,
    isRequesting: requestResetMutation.isPending,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
