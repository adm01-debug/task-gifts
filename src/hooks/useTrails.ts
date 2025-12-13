import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trailsService, type LearningTrail, type TrailModule, type TrailEnrollment, type ModuleProgress } from "@/services/trailsService";
import { useAuth } from "./useAuth";
import { profilesService } from "@/services/profilesService";
import { toast } from "sonner";

export const trailKeys = {
  all: ["trails"] as const,
  published: () => [...trailKeys.all, "published"] as const,
  byDepartment: (deptId: string) => [...trailKeys.all, "department", deptId] as const,
  detail: (id: string) => [...trailKeys.all, "detail", id] as const,
  enrollments: (userId: string) => [...trailKeys.all, "enrollments", userId] as const,
  moduleProgress: (userId: string, moduleIds: string[]) => [...trailKeys.all, "progress", userId, moduleIds] as const,
};

export function usePublishedTrails() {
  return useQuery({
    queryKey: trailKeys.published(),
    queryFn: () => trailsService.getPublishedTrails(),
  });
}

export function useTrailsByDepartment(departmentId: string) {
  return useQuery({
    queryKey: trailKeys.byDepartment(departmentId),
    queryFn: () => trailsService.getTrailsByDepartment(departmentId),
    enabled: !!departmentId,
  });
}

export function useTrailWithModules(trailId: string) {
  return useQuery({
    queryKey: trailKeys.detail(trailId),
    queryFn: () => trailsService.getTrailWithModules(trailId),
    enabled: !!trailId,
  });
}

export function useUserEnrollments() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: trailKeys.enrollments(user?.id || ""),
    queryFn: () => trailsService.getUserEnrollments(user!.id),
    enabled: !!user?.id,
  });
}

export function useModuleProgress(moduleIds: string[]) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: trailKeys.moduleProgress(user?.id || "", moduleIds),
    queryFn: () => trailsService.getUserModuleProgress(user!.id, moduleIds),
    enabled: !!user?.id && moduleIds.length > 0,
  });
}

export function useEnrollInTrail() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (trailId: string) => trailsService.enrollInTrail(user!.id, trailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trailKeys.enrollments(user!.id) });
      toast.success("Inscrição realizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao se inscrever na trilha");
    },
  });
}

export function useStartModule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (moduleId: string) => trailsService.startModule(user!.id, moduleId),
    onSuccess: (_, moduleId) => {
      queryClient.invalidateQueries({ queryKey: trailKeys.all });
    },
  });
}

export function useCompleteModule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ moduleId, score, xpReward, trailId, totalModules, completedModules }: { 
      moduleId: string; 
      score?: number;
      xpReward: number;
      trailId: string;
      totalModules: number;
      completedModules: number;
    }) => {
      // Complete the module
      const progress = await trailsService.completeModule(user!.id, moduleId, score);
      
      // Add XP for module completion
      await profilesService.addXp(user!.id, xpReward, "module_completion");
      
      // Calculate new progress percentage
      const newCompletedCount = completedModules + 1;
      const progressPercent = Math.round((newCompletedCount / totalModules) * 100);
      
      // Update enrollment progress
      await trailsService.updateEnrollmentProgress(user!.id, trailId, progressPercent);
      
      return { progress, progressPercent };
    },
    onSuccess: ({ progressPercent }) => {
      queryClient.invalidateQueries({ queryKey: trailKeys.all });
      
      if (progressPercent >= 100) {
        toast.success("🎉 Parabéns! Você completou a trilha!");
      } else {
        toast.success("Módulo concluído! +XP adicionado");
      }
    },
    onError: () => {
      toast.error("Erro ao completar módulo");
    },
  });
}

export function useCreateTrail() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (trail: Partial<LearningTrail>) => 
      trailsService.createTrail({ ...trail, created_by: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trailKeys.all });
      toast.success("Trilha criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar trilha");
    },
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (module: Partial<TrailModule>) => trailsService.createModule(module),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trailKeys.all });
    },
  });
}

export function useUpdateTrail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<LearningTrail> }) =>
      trailsService.updateTrail(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trailKeys.all });
      toast.success("Trilha atualizada!");
    },
  });
}

export function useDeleteTrail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trailsService.deleteTrail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trailKeys.all });
      toast.success("Trilha excluída");
    },
  });
}
