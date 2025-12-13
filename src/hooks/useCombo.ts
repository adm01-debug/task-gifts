import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { comboService, COMBO_TIERS } from "@/services/comboService";
import { useSoundEffects } from "./useSoundEffects";
import { toast } from "sonner";

export const comboKeys = {
  today: (userId: string) => ["combo", "today", userId] as const,
  history: (userId: string) => ["combo", "history", userId] as const,
};

// Store for tier-up explosion trigger
let tierUpCallback: ((tier: number) => void) | null = null;

export function setTierUpCallback(callback: ((tier: number) => void) | null) {
  tierUpCallback = callback;
}

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
    refetchInterval: 30000,
  });
}

export function useRegisterComboAction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { playComboTierUpSound, playComboActionSound } = useSoundEffects();

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
        const tierIndex = COMBO_TIERS.findIndex(
          (t) => t.multiplier === result.combo!.current_multiplier
        );
        
        // Trigger explosion effect
        if (tierUpCallback && tierIndex > 0) {
          tierUpCallback(tierIndex);
        }
        
        // Play tier-up sound
        playComboTierUpSound(tierIndex);

        const tier = comboService.getComboTier(result.combo.actions_count);
        toast.success(`🔥 COMBO ${tier.label}!`, {
          description: `Multiplicador x${tier.multiplier} ativo! +${result.bonusXp} XP bônus`,
        });
      } else if (result.bonusXp > 0 && result.combo) {
        // Play combo action sound
        playComboActionSound(result.combo.current_multiplier);
        
        toast.success(`Combo ativo!`, {
          description: `+${result.bonusXp} XP bônus (x${result.combo.current_multiplier})`,
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
