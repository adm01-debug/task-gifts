import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { comboService, COMBO_TIERS } from "@/services/comboService";
import { toast } from "sonner";

export const comboKeys = {
  today: (userId: string) => ["combo", "today", userId] as const,
  history: (userId: string) => ["combo", "history", userId] as const,
};

export function useTodayCombo() {
  const { user } = useAuth();

  return useQuery({
    queryKey: comboKeys.today(user?.id || ""),
    queryFn: async () => {
      if (!user?.id) return null;

      let combo = await comboService.getTodayCombo(user.id);

      if (!combo) {
        combo = await comboService.initTodayCombo(user.id);
      }

      return combo;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useRegisterComboAction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (baseXp: number) => {
      if (!user?.id) throw new Error("User not authenticated");
      return comboService.registerAction(user.id, baseXp);
    },
    onSuccess: (result) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: comboKeys.today(user.id) });
      }

      if (result.tierUp && result.combo) {
        const tier = comboService.getComboTier(result.combo.actions_count);
        toast.success(`🔥 COMBO ${tier.label}!`, {
          description: `Multiplicador x${tier.multiplier} ativo! +${result.bonusXp} XP bônus`,
        });
      } else if (result.bonusXp > 0) {
        toast.success(`Combo ativo!`, {
          description: `+${result.bonusXp} XP bônus (x${result.combo?.current_multiplier})`,
        });
      }
    },
  });
}

export function useComboHistory(days: number = 7) {
  const { user } = useAuth();

  return useQuery({
    queryKey: comboKeys.history(user?.id || ""),
    queryFn: async () => {
      if (!user?.id) return [];
      return comboService.getComboHistory(user.id, days);
    },
    enabled: !!user?.id,
  });
}

export { COMBO_TIERS };
