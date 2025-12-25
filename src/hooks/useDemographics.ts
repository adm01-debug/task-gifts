import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { demographicsService, type DemographicAttribute, type UserDemographicValue } from "@/services/demographicsService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useDemographics = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const attributesQuery = useQuery({
    queryKey: ['demographic-attributes'],
    queryFn: () => demographicsService.getAttributes(),
  });

  const userValuesQuery = useQuery({
    queryKey: ['user-demographic-values', user?.id],
    queryFn: () => demographicsService.getUserValues(user!.id),
    enabled: !!user?.id,
  });

  const createAttributeMutation = useMutation({
    mutationFn: (attribute: Omit<DemographicAttribute, 'id'>) => demographicsService.createAttribute(attribute),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demographic-attributes'] });
      toast.success('Atributo criado!');
    },
  });

  const updateAttributeMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DemographicAttribute> }) =>
      demographicsService.updateAttribute(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demographic-attributes'] });
      toast.success('Atributo atualizado!');
    },
  });

  const setValueMutation = useMutation({
    mutationFn: ({ attributeId, value }: { attributeId: string; value: string }) =>
      demographicsService.setUserValue(user!.id, attributeId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-demographic-values'] });
      toast.success('Valor salvo!');
    },
  });

  const getUserValue = (attributeId: string): string | undefined => {
    return userValuesQuery.data?.find(v => v.attribute_id === attributeId)?.value;
  };

  return {
    attributes: attributesQuery.data || [],
    userValues: userValuesQuery.data || [],
    isLoading: attributesQuery.isLoading,
    createAttribute: createAttributeMutation.mutate,
    updateAttribute: updateAttributeMutation.mutate,
    setValue: setValueMutation.mutate,
    getUserValue,
    getAttributeStats: demographicsService.getAttributeStats,
  };
};
