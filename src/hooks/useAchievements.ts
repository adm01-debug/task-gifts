import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { achievementsService } from "@/services/achievementsService";
import { toast } from "sonner";
import { useSoundEffects } from "./useSoundEffects";

export function useAllAchievements() {
  return useQuery({
    queryKey: ["achievements", "all"],
    queryFn: () => achievementsService.getAllAchievements(),
  });
}

export function useUserAchievements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["achievements", "user", user?.id],
    queryFn: () => achievementsService.getUserAchievements(user!.id),
    enabled: !!user?.id,
  });
}

export function useUnlockAchievement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { playAchievementSound } = useSoundEffects();

  return useMutation({
    mutationFn: (achievementKey: string) =>
      achievementsService.unlockAchievement(user!.id, achievementKey),
    onSuccess: (result) => {
      if (result.success && result.achievement) {
        queryClient.invalidateQueries({ queryKey: ["achievements", "user"] });
        queryClient.invalidateQueries({ queryKey: ["profiles"] });
        
        playAchievementSound();
        
        toast.success(`🏆 ${result.achievement.name}`, {
          description: `${result.achievement.description} (+${result.achievement.xp_reward} XP, +${result.achievement.coin_reward} moedas)`,
          duration: 5000,
        });
      }
    },
  });
}

export function useCheckComboAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { playAchievementSound } = useSoundEffects();

  return useMutation({
    mutationFn: (multiplier: number) =>
      achievementsService.checkComboAchievements(user!.id, multiplier),
    onSuccess: (achievement) => {
      if (achievement) {
        queryClient.invalidateQueries({ queryKey: ["achievements", "user"] });
        queryClient.invalidateQueries({ queryKey: ["profiles"] });
        
        playAchievementSound();
        
        toast.success(`🏆 Conquista: ${achievement.name}`, {
          description: `${achievement.description} (+${achievement.xp_reward} XP, +${achievement.coin_reward} moedas)`,
          duration: 6000,
        });
      }
    },
  });
}
