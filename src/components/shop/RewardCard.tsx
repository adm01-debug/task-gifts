import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shopService, type ShopReward } from "@/services/shopService";

interface RewardCardProps {
  reward: ShopReward;
  userCoins: number;
  onPurchase: (reward: ShopReward) => void;
  purchasingRewardId: string | null;
}

export const RewardCard = forwardRef<HTMLDivElement, RewardCardProps>(function RewardCard(
  { reward, userCoins, onPurchase, purchasingRewardId },
  ref
) {
  const isPurchasing = purchasingRewardId === reward.id;
  const rarityConfig = shopService.getRarityConfig(reward.rarity);
  const categoryConfig = shopService.getCategoryConfig(reward.category);
  const canAfford = userCoins >= reward.price_coins;
  const inStock = reward.stock === null || reward.stock > 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="h-full"
    >
      <Card
        className={`relative overflow-hidden h-full border-2 transition-all duration-300 ${rarityConfig.borderColor} ${rarityConfig.bgGlow} shadow-lg hover:shadow-xl`}
      >
        {reward.rarity !== "common" && (
          <div className={`absolute inset-0 opacity-10 ${rarityConfig.color}`} />
        )}
        <div className="absolute top-2 right-2 z-10">
          <Badge className={`${rarityConfig.color} text-white text-xs font-bold`}>
            {rarityConfig.label}
          </Badge>
        </div>
        {reward.stock !== null && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary" className="text-xs">
              {reward.stock > 0 ? `${reward.stock} restantes` : "Esgotado"}
            </Badge>
          </div>
        )}

        <CardContent className="pt-12 pb-4 flex flex-col h-full">
          <div className="flex justify-center mb-4">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                reward.rarity === "legendary"
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse"
                  : reward.rarity === "epic"
                  ? "bg-gradient-to-br from-purple-400 to-pink-500"
                  : reward.rarity === "rare"
                  ? "bg-gradient-to-br from-blue-400 to-cyan-500"
                  : "bg-muted"
              }`}
            >
              {categoryConfig.icon}
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg text-center mb-1">{reward.name}</h3>
            <p className="text-sm text-muted-foreground text-center mb-3 line-clamp-2">
              {reward.description}
            </p>
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="text-xs">{categoryConfig.label}</Badge>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-center gap-1 mb-3">
              <Coins className="w-5 h-5 text-amber-500" />
              <span className="text-xl font-bold">{reward.price_coins}</span>
            </div>
            <Button
              onClick={() => onPurchase(reward)}
              disabled={!canAfford || !inStock || isPurchasing}
              className={`w-full ${
                reward.rarity === "legendary"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  : reward.rarity === "epic"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  : ""
              }`}
            >
              {!inStock ? "Esgotado" : !canAfford ? "Moedas insuficientes" : isPurchasing ? "Resgatando..." : "Resgatar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
