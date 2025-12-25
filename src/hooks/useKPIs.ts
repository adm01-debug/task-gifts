import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kpiService, type KPI } from "@/services/kpiService";
import { toast } from "sonner";

export const useKPIs = () => {
  const queryClient = useQueryClient();

  const kpisQuery = useQuery({
    queryKey: ['kpis'],
    queryFn: () => kpiService.getAll(),
  });

  const categoriesQuery = useQuery({
    queryKey: ['kpi-categories'],
    queryFn: () => kpiService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (kpi: Omit<KPI, 'id' | 'created_at' | 'status' | 'trend'>) => 
      kpiService.create(kpi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('KPI criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar KPI');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<KPI> }) =>
      kpiService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('KPI atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar KPI');
    },
  });

  const updateValueMutation = useMutation({
    mutationFn: ({ id, value, notes }: { id: string; value: number; notes?: string }) =>
      kpiService.updateValue(id, value, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('Valor do KPI atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar valor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => kpiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('KPI removido!');
    },
    onError: () => {
      toast.error('Erro ao remover KPI');
    },
  });

  return {
    kpis: kpisQuery.data || [],
    categories: categoriesQuery.data || [],
    isLoading: kpisQuery.isLoading,
    createKPI: createMutation.mutate,
    updateKPI: updateMutation.mutate,
    updateKPIValue: updateValueMutation.mutate,
    deleteKPI: deleteMutation.mutate,
    formatValue: kpiService.formatValue,
    getStatusColor: kpiService.getStatusColor,
    getStatusIcon: kpiService.getStatusIcon,
  };
};

export const useKPIDetail = (kpiId: string) => {
  const kpiQuery = useQuery({
    queryKey: ['kpi', kpiId],
    queryFn: () => kpiService.getById(kpiId),
    enabled: !!kpiId,
  });

  const historyQuery = useQuery({
    queryKey: ['kpi-history', kpiId],
    queryFn: () => kpiService.getHistory(kpiId),
    enabled: !!kpiId,
  });

  return {
    kpi: kpiQuery.data,
    history: historyQuery.data || [],
    isLoading: kpiQuery.isLoading,
  };
};
