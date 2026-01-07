import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Gift, 
  Lock, 
  Star, 
  Zap,
  Sparkles,
  Trophy,
  Coins,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SeasonReward {
  id: string;
  tier: number;
  xpRequired: number;
  freeReward?: {
    type: "xp" | "coins" | "badge" | "title" | "avatar";
    value: string | number;
    icon: string;
  };
  premiumReward?: {
    type: "xp" | "coins" | "badge" | "title" | "avatar" | "exclusive";
    value: string | number;
    icon: string;
    rarity: "common" | "rare" | "epic" | "legendary";
  };
}

const seasonRewards: SeasonReward[] = [
  {
    id: "1",
    tier: 1,
    xpRequired: 0,
    freeReward: { type: "coins", value: 50, icon: "🪙" },
    premiumReward: { type: "coins", value: 200, icon: "💰", rarity: "common" }
  },
  {
    id: "2",
    tier: 2,
    xpRequired: 500,
    freeReward: { type: "xp", value: 100, icon: "⚡" },
    premiumReward: { type: "badge", value: "Explorador", icon: "🏅", rarity: "rare" }
  },
  {
    id: "3",
    tier: 3,
    xpRequired: 1200,
    freeReward: { type: "coins", value: 100, icon: "🪙" },
    premiumReward: { type: "avatar", value: "Frame Dourado", icon: "🖼️", rarity: "epic" }
  },
  {
    id: "4",
    tier: 4,
    xpRequired: 2000,
    premiumReward: { type: "title", value: "Lendário", icon: "👑", rarity: "legendary" }
  },
  {
    id: "5",
    tier: 5,
    xpRequired: 3000,
    freeReward: { type: "xp", value: 250, icon: "⚡" },
    premiumReward: { type: "exclusive", value: "Efeito Especial", icon: "✨", rarity: "legendary" }
  },
  {
    id: "6",
    tier: 6,
    xpRequired: 4000,
    freeReward: { type: "coins", value: 150, icon: "🪙" },
    premiumReward: { type: "coins", value: 500, icon: "💎", rarity: "epic" }
  },
  {
    id: "7",
    tier: 7,
    xpRequired: 5500,
    freeReward: { type: "badge", value: "Veterano", icon: "🎖️" },
    premiumReward: { type: "avatar", value: "Skin Exclusiva", icon: "🎭", rarity: "legendary" }
  },
  {
    id: "8",
    tier: 8,
    xpRequired: 7000,
    freeReward: { type: "xp", value: 500, icon: "⚡" },
    premiumReward: { type: "exclusive", value: "Título Sazonal", icon: "🏆", rarity: "legendary" }
  }
];

const rarityColors = {
  common: "from-slate-400 to-slate-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-amber-400 to-orange-500"
};

export function SeasonPass() {
  const [isPremium] = useState(false);
  const [currentXP] = useState(1850);
  const [claimedRewards, setClaimedRewards] = useState<string[]>(["1"]);
  const [visibleTiers, setVisibleTiers] = useState({ start: 0, end: 4 });

  const currentTier = seasonRewards.findIndex(r => r.xpRequired > currentXP);
  const actualTier = currentTier === -1 ? seasonRewards.length : currentTier;
  const nextTierXP = seasonRewards[actualTier]?.xpRequired || seasonRewards[seasonRewards.length - 1].xpRequired;
  const prevTierXP = seasonRewards[actualTier - 1]?.xpRequired || 0;
  const tierProgress = ((currentXP - prevTierXP) / (nextTierXP - prevTierXP)) * 100;

  const claimReward = (rewardId: string) => {
    setClaimedRewards(prev => [...prev, rewardId]);
  };

  const canClaim = (reward: SeasonReward, isPremiumReward: boolean) => {
    if (claimedRewards.includes(`${reward.id}-${isPremiumReward ? 'premium' : 'free'}`)) return false;
    if (currentXP < reward.xpRequired) return false;
    if (isPremiumReward && !isPremium) return false;
    return true;
  };

  const scrollTiers = (direction: "left" | "right") => {
    setVisibleTiers(prev => {
      if (direction === "left" && prev.start > 0) {
        return { start: prev.start - 1, end: prev.end - 1 };
      }
      if (direction === "right" && prev.end < seasonRewards.length) {
        return { start: prev.start + 1, end: prev.end + 1 };
      }
      return prev;
    });
  };

  const visibleRewards = seasonRewards.slice(visibleTiers.start, visibleTiers.end);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Passe de Temporada
                <Badge variant="outline" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  Temporada 1
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                21 dias restantes
              </p>
            </div>
          </div>
          
          {!isPremium && (
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade Premium
            </Button>
          )}
        </div>

        {/* XP Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-primary" />
              {currentXP.toLocaleString()} XP
            </span>
            <span className="text-muted-foreground">
              Próximo tier: {nextTierXP.toLocaleString()} XP
            </span>
          </div>
          <Progress value={tierProgress} className="h-3" />
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Tier Navigation */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollTiers("left")}
            disabled={visibleTiers.start === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 overflow-hidden">
            <div className="flex gap-3 justify-center">
              <AnimatePresence mode="popLayout">
                {visibleRewards.map((reward, index) => {
                  const isUnlocked = currentXP >= reward.xpRequired;
                  const isCurrent = reward.tier === actualTier;

                  return (
                    <motion.div
                      key={reward.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`relative flex flex-col items-center p-3 rounded-lg border-2 transition-all min-w-[140px] ${
                        isCurrent 
                          ? "border-primary bg-primary/10" 
                          : isUnlocked 
                            ? "border-green-500/50 bg-green-500/5" 
                            : "border-muted bg-muted/20"
                      }`}
                    >
                      {/* Tier Badge */}
                      <div className={`absolute -top-3 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isUnlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        Tier {reward.tier}
                      </div>

                      {/* Free Reward */}
                      <div className="mt-3 mb-2">
                        {reward.freeReward ? (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`p-3 rounded-lg border ${
                              isUnlocked ? "bg-card border-border" : "bg-muted/50 border-muted"
                            }`}
                          >
                            <div className="text-2xl text-center">{reward.freeReward.icon}</div>
                            <div className="text-xs text-center mt-1 text-muted-foreground">
                              {typeof reward.freeReward.value === "number" 
                                ? `+${reward.freeReward.value}` 
                                : reward.freeReward.value}
                            </div>
                            {canClaim(reward, false) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 w-full h-6 text-xs"
                                onClick={() => claimReward(`${reward.id}-free`)}
                              >
                                <Gift className="h-3 w-3 mr-1" />
                                Resgatar
                              </Button>
                            )}
                          </motion.div>
                        ) : (
                          <div className="p-3 rounded-lg border border-dashed border-muted bg-muted/20">
                            <div className="text-2xl text-center opacity-30">—</div>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-1" />

                      {/* Premium Reward */}
                      <div className="relative">
                        {reward.premiumReward ? (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`p-3 rounded-lg border-2 ${
                              isPremium && isUnlocked
                                ? `bg-gradient-to-br ${rarityColors[reward.premiumReward.rarity]} border-transparent`
                                : "bg-muted/50 border-amber-500/30"
                            }`}
                          >
                            {!isPremium && (
                              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                <Lock className="h-5 w-5 text-amber-500" />
                              </div>
                            )}
                            <div className="text-2xl text-center">{reward.premiumReward.icon}</div>
                            <div className={`text-xs text-center mt-1 ${
                              isPremium && isUnlocked ? "text-white" : "text-muted-foreground"
                            }`}>
                              {typeof reward.premiumReward.value === "number" 
                                ? `+${reward.premiumReward.value}` 
                                : reward.premiumReward.value}
                            </div>
                            {isPremium && canClaim(reward, true) && (
                              <Button
                                size="sm"
                                className="mt-2 w-full h-6 text-xs bg-white/20 hover:bg-white/30"
                                onClick={() => claimReward(`${reward.id}-premium`)}
                              >
                                <Star className="h-3 w-3 mr-1" />
                                Resgatar
                              </Button>
                            )}
                          </motion.div>
                        ) : (
                          <div className="p-3 rounded-lg border border-dashed border-muted bg-muted/20">
                            <div className="text-2xl text-center opacity-30">—</div>
                          </div>
                        )}
                        <Badge 
                          variant="outline" 
                          className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-background"
                        >
                          <Crown className="h-2.5 w-2.5 mr-0.5 text-amber-500" />
                          Premium
                        </Badge>
                      </div>

                      {/* XP Requirement */}
                      <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {reward.xpRequired.toLocaleString()} XP
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => scrollTiers("right")}
            disabled={visibleTiers.end >= seasonRewards.length}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Season Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 p-4 rounded-lg bg-muted/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{actualTier}</div>
            <div className="text-xs text-muted-foreground">Tier Atual</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">{claimedRewards.length}</div>
            <div className="text-xs text-muted-foreground">Recompensas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">21</div>
            <div className="text-xs text-muted-foreground">Dias Restantes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
