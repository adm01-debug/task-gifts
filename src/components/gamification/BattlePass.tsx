import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, Check, Star, Crown, Zap, Gift,
  ChevronRight, Sparkles, ArrowUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BattlePassReward {
  level: number;
  free: {
    type: string;
    name: string;
    icon: string;
    value?: number;
  };
  premium: {
    type: string;
    name: string;
    icon: string;
    value?: number;
  };
}

interface BattlePassData {
  currentLevel: number;
  maxLevel: number;
  xpProgress: number;
  xpPerLevel: number;
  isPremium: boolean;
  rewards: BattlePassReward[];
}

const battlePassData: BattlePassData = {
  currentLevel: 15,
  maxLevel: 50,
  xpProgress: 780,
  xpPerLevel: 1000,
  isPremium: false,
  rewards: [
    { level: 1, free: { type: "coins", name: "100 Coins", icon: "💰", value: 100 }, premium: { type: "coins", name: "250 Coins", icon: "💰", value: 250 } },
    { level: 5, free: { type: "xp", name: "500 XP", icon: "⚡", value: 500 }, premium: { type: "badge", name: "Badge VIP", icon: "🏅" } },
    { level: 10, free: { type: "coins", name: "250 Coins", icon: "💰", value: 250 }, premium: { type: "avatar", name: "Avatar Elite", icon: "👤" } },
    { level: 15, free: { type: "badge", name: "Dedicado", icon: "🎖️" }, premium: { type: "theme", name: "Tema Gold", icon: "✨" } },
    { level: 20, free: { type: "xp", name: "1000 XP", icon: "⚡", value: 1000 }, premium: { type: "title", name: "Campeão", icon: "🏆" } },
    { level: 25, free: { type: "coins", name: "500 Coins", icon: "💰", value: 500 }, premium: { type: "effect", name: "Aura Lendária", icon: "🌟" } },
    { level: 30, free: { type: "badge", name: "Veterano", icon: "🎗️" }, premium: { type: "avatar", name: "Avatar Mítico", icon: "🐉" } },
    { level: 40, free: { type: "xp", name: "2000 XP", icon: "⚡", value: 2000 }, premium: { type: "title", name: "Lenda", icon: "👑" } },
    { level: 50, free: { type: "badge", name: "Mestre", icon: "🏅" }, premium: { type: "skin", name: "Skin Exclusiva", icon: "💎" } },
  ],
};

interface BattlePassCardProps {
  className?: string;
}

export const BattlePassCard = memo(function BattlePassCard({ 
  className 
}: BattlePassCardProps) {
  const [showFull, setShowFull] = useState(false);
  const data = battlePassData;
  
  const progressPercent = (data.xpProgress / data.xpPerLevel) * 100;
  const overallProgress = (data.currentLevel / data.maxLevel) * 100;

  // Find visible rewards (current and next few)
  const visibleRewards = data.rewards.filter(
    r => r.level >= data.currentLevel - 5 && r.level <= data.currentLevel + 10
  ).slice(0, 5);

  return (
    <>
      <Card 
        className={cn(
          "relative overflow-hidden cursor-pointer group",
          "bg-gradient-to-br from-purple-500/5 via-background to-amber-500/5",
          className
        )}
        onClick={() => setShowFull(true)}
      >
        {/* Premium badge */}
        {!data.isPremium && (
          <div className="absolute top-3 right-3 z-10">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-lg"
            >
              <Crown className="w-3 h-3" />
              Upgrade
            </motion.div>
          </div>
        )}

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Passe de Batalha</h3>
              <p className="text-sm text-muted-foreground">
                Temporada Atual • Nível {data.currentLevel}
              </p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Nível {data.currentLevel} → {data.currentLevel + 1}
              </span>
              <span className="font-semibold">
                {data.xpProgress} / {data.xpPerLevel} XP
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Rewards Preview */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {visibleRewards.map((reward) => {
              const isUnlocked = reward.level <= data.currentLevel;
              const isCurrent = reward.level === data.currentLevel;
              
              return (
                <motion.div
                  key={reward.level}
                  className={cn(
                    "flex-shrink-0 relative p-3 rounded-xl border-2 transition-all min-w-[80px]",
                    isCurrent 
                      ? "border-primary bg-primary/10 scale-105" 
                      : isUnlocked 
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-border bg-muted/30 opacity-60"
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Level badge */}
                  <div className={cn(
                    "absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    isUnlocked 
                      ? "bg-emerald-500 text-white" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {reward.level}
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    {/* Free reward */}
                    <span className="text-xl">{reward.free.icon}</span>
                    
                    {/* Premium reward (locked) */}
                    <div className={cn(
                      "relative",
                      !data.isPremium && "opacity-50"
                    )}>
                      <span className="text-xl">{reward.premium.icon}</span>
                      {!data.isPremium && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-amber-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Claimed indicator */}
                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                  )}
                </motion.div>
              );
            })}
            
            <div className="flex-shrink-0 flex items-center px-2">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {data.rewards.length - data.currentLevel} recompensas restantes
            </div>
            <Button size="sm" variant="outline" className="gap-2">
              Ver Tudo
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Full Modal */}
      <BattlePassModal 
        isOpen={showFull} 
        onClose={() => setShowFull(false)}
        data={data}
      />
    </>
  );
});

interface BattlePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BattlePassData;
}

const BattlePassModal = memo(function BattlePassModal({
  isOpen,
  onClose,
  data,
}: BattlePassModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[85vh] overflow-hidden"
        >
          <Card className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-white/20">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Passe de Batalha</h2>
                    <p className="text-white/80">Temporada Atual</p>
                  </div>
                </div>
                
                {!data.isPremium && (
                  <Button 
                    className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold gap-2 hover:opacity-90"
                  >
                    <Crown className="w-4 h-4" />
                    Ativar Premium
                  </Button>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Nível {data.currentLevel}</span>
                  <span>Nível {data.maxLevel}</span>
                </div>
                <Progress 
                  value={(data.currentLevel / data.maxLevel) * 100} 
                  className="h-3 bg-white/20"
                />
              </div>
            </div>

            {/* Rewards Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-3">
                {/* Header row */}
                <div className="grid grid-cols-3 gap-3 text-sm font-medium text-muted-foreground px-3">
                  <div>Nível</div>
                  <div className="text-center">Gratuito</div>
                  <div className="text-center flex items-center justify-center gap-1">
                    <Crown className="w-3 h-3 text-amber-500" />
                    Premium
                  </div>
                </div>

                {data.rewards.map((reward) => {
                  const isUnlocked = reward.level <= data.currentLevel;
                  
                  return (
                    <div
                      key={reward.level}
                      className={cn(
                        "grid grid-cols-3 gap-3 p-3 rounded-xl border transition-colors",
                        isUnlocked 
                          ? "bg-primary/5 border-primary/20" 
                          : "bg-muted/20 border-transparent"
                      )}
                    >
                      {/* Level */}
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          isUnlocked 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {reward.level}
                        </div>
                        {isUnlocked && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>

                      {/* Free Reward */}
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl">{reward.free.icon}</span>
                        <span className="text-sm">{reward.free.name}</span>
                      </div>

                      {/* Premium Reward */}
                      <div className={cn(
                        "flex items-center justify-center gap-2",
                        !data.isPremium && "opacity-50"
                      )}>
                        <span className="text-xl">{reward.premium.icon}</span>
                        <span className="text-sm">{reward.premium.name}</span>
                        {!data.isPremium && !isUnlocked && (
                          <Lock className="w-3 h-3 text-amber-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export { battlePassData };
export type { BattlePassData, BattlePassReward };
