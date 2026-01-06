import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Version {
  id: string;
  entity_type: string;
  entity_id: string;
  version_number: number;
  data: Record<string, unknown>;
  changed_by: string | null;
  changed_at: string;
  change_summary: string | null;
}

// Helper para acessar tabelas dinâmicas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTable = (tableName: string) => (supabase as any).from(tableName);

export function useVersions(entityType: string, entityId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['versions', entityType, entityId];

  const { data: versions = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await getTable('entity_versions')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return data as Version[];
    },
    enabled: !!entityId,
  });

  const restoreMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const version = versions.find(v => v.id === versionId);
      if (!version) throw new Error('Versão não encontrada');
      const { error } = await getTable(entityType)
        .update(version.data)
        .eq('id', entityId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Versão restaurada!');
    },
  });

  return { versions, isLoading, restoreVersion: restoreMutation.mutate, currentVersion: versions[0] };
}
