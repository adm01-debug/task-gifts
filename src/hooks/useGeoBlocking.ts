import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  geoBlockingService, 
  CreateCountryInput, 
  UpdateCountryInput, 
  UpdateSettingsInput 
} from "@/services/geoBlockingService";
import { toast } from "sonner";

export function useGeoBlocking() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['geo-settings'],
    queryFn: () => geoBlockingService.getSettings(),
  });

  const countriesQuery = useQuery({
    queryKey: ['geo-allowed-countries'],
    queryFn: () => geoBlockingService.getAllowedCountries(),
  });

  const accessLogsQuery = useQuery({
    queryKey: ['geo-access-logs'],
    queryFn: () => geoBlockingService.getAccessLogs(100),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (input: UpdateSettingsInput) => geoBlockingService.updateSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-settings'] });
      toast.success('Configurações atualizadas');
    },
    onError: () => {
      toast.error('Erro ao atualizar configurações');
    },
  });

  const addCountryMutation = useMutation({
    mutationFn: (input: CreateCountryInput) => geoBlockingService.addCountry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-allowed-countries'] });
      toast.success('País adicionado à whitelist');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast.error('Este país já está na whitelist');
      } else {
        toast.error('Erro ao adicionar país');
      }
    },
  });

  const updateCountryMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCountryInput }) => 
      geoBlockingService.updateCountry(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-allowed-countries'] });
      toast.success('País atualizado');
    },
    onError: () => {
      toast.error('Erro ao atualizar país');
    },
  });

  const deleteCountryMutation = useMutation({
    mutationFn: (id: string) => geoBlockingService.deleteCountry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-allowed-countries'] });
      toast.success('País removido da whitelist');
    },
    onError: () => {
      toast.error('Erro ao remover país');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      geoBlockingService.toggleCountryStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-allowed-countries'] });
    },
    onError: () => {
      toast.error('Erro ao alterar status');
    },
  });

  return {
    settings: settingsQuery.data,
    countries: countriesQuery.data || [],
    accessLogs: accessLogsQuery.data || [],
    isLoading: settingsQuery.isLoading || countriesQuery.isLoading,
    isLoadingLogs: accessLogsQuery.isLoading,
    updateSettings: updateSettingsMutation.mutate,
    addCountry: addCountryMutation.mutate,
    updateCountry: updateCountryMutation.mutate,
    deleteCountry: deleteCountryMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate,
    isUpdatingSettings: updateSettingsMutation.isPending,
    isAddingCountry: addCountryMutation.isPending,
    refetch: () => {
      settingsQuery.refetch();
      countriesQuery.refetch();
    },
    refetchLogs: accessLogsQuery.refetch,
  };
}
