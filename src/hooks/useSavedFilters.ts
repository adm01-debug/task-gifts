/**
 * Hook para Filtros Salvos
 * 
 * @module hooks/useSavedFilters
 * @description Gerencia filtros salvos por usuário e entidade
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============================================
// TIPOS
// ============================================

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
}

interface SaveFilterInput {
  name: string;
  filters: Record<string, unknown>;
  is_default?: boolean;
}

interface SavedFilterRow {
  id: string;
  user_id: string;
  entity_type: string;
  name: string;
  filters: unknown;
  is_default: boolean;
  created_at: string;
}

// Helper para acessar tabela dinâmica
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFiltersTable = () => (supabase as any).from('saved_filters');

// ============================================
// HOOK
// ============================================

export function useSavedFilters(entityType: string) {
  const queryClient = useQueryClient();
  const queryKey = ['saved-filters', entityType];

  // Listar filtros salvos
  const { data: filters = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await getFiltersTable()
        .select('*')
        .eq('user_id', user.id)
        .eq('entity_type', entityType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as SavedFilterRow[]).map(row => ({
        id: row.id,
        name: row.name,
        filters: row.filters as Record<string, unknown>,
        is_default: row.is_default,
        created_at: row.created_at,
      })) as SavedFilter[];
    },
  });

  // Obter filtro padrão
  const defaultFilter = filters.find(f => f.is_default);

  // Salvar novo filtro
  const saveMutation = useMutation({
    mutationFn: async (input: SaveFilterInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Se marcado como padrão, remove padrão dos outros
      if (input.is_default) {
        await getFiltersTable()
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('entity_type', entityType);
      }

      const { data, error } = await getFiltersTable()
        .insert({
          user_id: user.id,
          entity_type: entityType,
          name: input.name,
          filters: input.filters,
          is_default: input.is_default ?? false,
        })
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to save filter');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro salvo com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao salvar filtro: ${error.message}`);
    },
  });

  // Atualizar filtro
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...input }: SaveFilterInput & { id: string }) => {
      const { error } = await getFiltersTable()
        .update(input)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro atualizado!');
    },
  });

  // Deletar filtro
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getFiltersTable()
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro removido');
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  // Definir como padrão
  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Remove padrão de todos
      await getFiltersTable()
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('entity_type', entityType);
      
      // Define novo padrão
      const { error } = await getFiltersTable()
        .update({ is_default: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro padrão definido');
    },
  });

  return {
    filters,
    isLoading,
    defaultFilter,
    saveFilter: saveMutation.mutate,
    updateFilter: updateMutation.mutate,
    deleteFilter: deleteMutation.mutate,
    setDefault: setDefaultMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}

export default useSavedFilters;
