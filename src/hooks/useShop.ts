import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService, type RewardCategory } from "@/services/shopService";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const shopKeys = {
  all: ["shop"] as const,
  rewards: () => [...shopKeys.all, "rewards"] as const,
  rewardsByCategory: (category: RewardCategory) =>
    [...shopKeys.rewards(), category] as const,
  purchases: (userId: string) => [...shopKeys.all, "purchases", userId] as const,
};

export function useShopRewards() {
  return useQuery({
    queryKey: shopKeys.rewards(),
    queryFn: () => shopService.getRewards(),
    staleTime: 60000,
  });
}

export function useShopRewardsByCategory(category: RewardCategory) {
  return useQuery({
    queryKey: shopKeys.rewardsByCategory(category),
    queryFn: () => shopService.getRewardsByCategory(category),
    staleTime: 60000,
  });
}

export function useUserPurchases() {
  const { user } = useAuth();

  return useQuery({
    queryKey: shopKeys.purchases(user?.id ?? ""),
    queryFn: () => shopService.getUserPurchases(user!.id),
    enabled: !!user,
    staleTime: 30000,
  });
}

export function usePurchaseReward() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ rewardId, quantity = 1 }: { rewardId: string; quantity?: number }) =>
      shopService.purchaseReward(user!.id, rewardId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.all });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("🎉 Recompensa resgatada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao resgatar recompensa");
    },
  });
}
