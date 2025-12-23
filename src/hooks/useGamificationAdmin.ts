import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import * as gamificationService from "@/services/gamificationAdminService";
import { toast } from "sonner";

export function useGamificationThemes() {
  return useQuery({
    queryKey: ["gamification-themes"],
    queryFn: gamificationService.getThemes,
  });
}

export function useGamificationThemeByDepartment(departmentId: string | null) {
  return useQuery({
    queryKey: ["gamification-themes", "department", departmentId],
    queryFn: () => departmentId ? gamificationService.getThemeByDepartment(departmentId) : null,
    enabled: !!departmentId,
  });
}

export function useCreateTheme() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: Omit<gamificationService.GamificationTheme, 'id' | 'created_at' | 'updated_at' | 'created_by'>) =>
      gamificationService.createTheme({ ...data, created_by: user?.id || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification-themes"] });
      toast.success("Tema criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar tema: ${error.message}`);
    },
  });
}

export function useUpdateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<gamificationService.GamificationTheme> }) =>
      gamificationService.updateTheme(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification-themes"] });
      toast.success("Tema atualizado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar tema: ${error.message}`);
    },
  });
}

export function useDeleteTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationService.deleteTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification-themes"] });
      toast.success("Tema removido!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover tema: ${error.message}`);
    },
  });
}

// Ranks hooks
export function useCustomRanks(themeId: string | null) {
  return useQuery({
    queryKey: ["custom-ranks", themeId],
    queryFn: () => themeId ? gamificationService.getRanksByTheme(themeId) : [],
    enabled: !!themeId,
  });
}

export function useCreateRank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationService.createRank,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["custom-ranks", variables.theme_id] });
      toast.success("Rank criado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar rank: ${error.message}`);
    },
  });
}

export function useUpdateRank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<gamificationService.CustomRank> }) =>
      gamificationService.updateRank(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-ranks"] });
      toast.success("Rank atualizado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar rank: ${error.message}`);
    },
  });
}

export function useDeleteRank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationService.deleteRank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-ranks"] });
      toast.success("Rank removido!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover rank: ${error.message}`);
    },
  });
}

// Badges hooks
export function useCustomBadges(themeId: string | null) {
  return useQuery({
    queryKey: ["custom-badges", themeId],
    queryFn: () => themeId ? gamificationService.getBadgesByTheme(themeId) : [],
    enabled: !!themeId,
  });
}

export function useCreateBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationService.createBadge,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["custom-badges", variables.theme_id] });
      toast.success("Badge criada!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar badge: ${error.message}`);
    },
  });
}

export function useUpdateBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<gamificationService.CustomBadge> }) =>
      gamificationService.updateBadge(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-badges"] });
      toast.success("Badge atualizada!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar badge: ${error.message}`);
    },
  });
}

export function useDeleteBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationService.deleteBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-badges"] });
      toast.success("Badge removida!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover badge: ${error.message}`);
    },
  });
}

// Titles hooks
export function useCustomTitles(themeId: string | null) {
  return useQuery({
    queryKey: ["custom-titles", themeId],
    queryFn: () => themeId ? gamificationService.getTitlesByTheme(themeId) : [],
    enabled: !!themeId,
  });
}

export function useCreateTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationService.createTitle,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["custom-titles", variables.theme_id] });
      toast.success("Título criado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar título: ${error.message}`);
    },
  });
}

export function useUpdateTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<gamificationService.CustomTitle> }) =>
      gamificationService.updateTitle(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-titles"] });
      toast.success("Título atualizado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar título: ${error.message}`);
    },
  });
}

export function useDeleteTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationService.deleteTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-titles"] });
      toast.success("Título removido!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover título: ${error.message}`);
    },
  });
}

// Level configs hooks
export function useLevelConfigs(themeId: string | null) {
  return useQuery({
    queryKey: ["level-configs", themeId],
    queryFn: () => themeId ? gamificationService.getLevelConfigsByTheme(themeId) : [],
    enabled: !!themeId,
  });
}

export function useApplyPreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ themeId, presetKey }: { themeId: string; presetKey: keyof typeof gamificationService.THEME_PRESETS }) =>
      gamificationService.applyPresetToTheme(themeId, presetKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification-themes"] });
      queryClient.invalidateQueries({ queryKey: ["custom-ranks"] });
      queryClient.invalidateQueries({ queryKey: ["level-configs"] });
      toast.success("Preset aplicado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao aplicar preset: ${error.message}`);
    },
  });
}

export function useGenerateDefaultLevels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ themeId, maxLevel }: { themeId: string; maxLevel?: number }) =>
      gamificationService.generateDefaultLevels(themeId, maxLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["level-configs"] });
      toast.success("Níveis gerados com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao gerar níveis: ${error.message}`);
    },
  });
}
