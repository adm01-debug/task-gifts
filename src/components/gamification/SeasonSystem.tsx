import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Trophy, Flame, Star, Clock, 
  ChevronRight, Zap, Crown, Gift, Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Season {
  id: string;
  name: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  currentLevel: number;
  maxLevel: number;
  xpProgress: number;
  xpRequired: number;
  rewards: SeasonReward[];
  bonusMultiplier: number;
  color: string;
  gradient: string;
}

interface SeasonReward {
  level: number;
  type: "xp" | "coins" | "badge" | "title" | "avatar" | "theme";
  name: string;
  icon: string;
  claimed: boolean;
  premium?: boolean;
}

const currentSeason: Season = {
  id: "s1-2024",
  name: "Temporada do Conhecimento",
  theme: "knowledge",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-03-31"),
  currentLevel: 12,
  maxLevel: 50,
  xpProgress: 1840,
  xpRequired: 2500,
  bonusMultiplier: 1.5,
  color: "text-emerald-500",
  gradient: "from-emerald-500 to-teal-500",
  rewards: [
    { level: 5, type: "coins", name: "500 Coins", icon: "💰", claimed: true },
    { level: 10, type: "badge", name: "Estudioso", icon: "📚", claimed: true },
    { level: 15, type: "title", name: "Mestre do Saber", icon: "🎓", claimed: false },
    { level: 20, type: "avatar", name: "Avatar Sábio", icon: "🧙", claimed: false, premium: true },
    { level: 25, type: "xp", name: "5000 XP Bônus", icon: "⚡", claimed: false },
    { level: 30, type: "theme", name: "Tema Biblioteca", icon: "🏛️", claimed: false, premium: true },
    { level: 40, type: "badge", name: "Lendário", icon: "👑", claimed: false },
    { level: 50, type: "title", name: "O Iluminado", icon: "✨", claimed: false, premium: true },
  ],
};

interface SeasonBannerProps {
  className?: string;
  compact?: boolean;
}

export const SeasonBanner = memo(function SeasonBanner({ 
  className,
  compact = false
}: SeasonBannerProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const season = currentSeason;
  const progressPercent = (season.xpProgress / season.xpRequired) * 100;
  const daysRemaining = Math.ceil(
    (season.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const nextReward = season.rewards.find(r => r.level > season.currentLevel);

  if (compact) {
    return (
      <Card 
        className={cn(
          "p-3 cursor-pointer hover:shadow-md transition-all",
          "bg-gradient-to-r",
          season.gradient,
          className
        )}
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-center gap-3 text-white">
          <Sparkles className="w-5 h-5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{season.name}</p>
            <p className="text-xs opacity-80">Nível {season.currentLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">{daysRemaining}d restantes</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card 
        className={cn(
          "relative overflow-hidden cursor-pointer group",
          className
        )}
        onClick={() => setShowDetails(true)}
      >
        {/* Background gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-10",
          season.gradient
        )} />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={cn("absolute w-2 h-2 rounded-full", season.color.replace("text-", "bg-"))}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className={cn(
                  "p-2.5 rounded-xl bg-gradient-to-br",
                  season.gradient
                )}
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg">{season.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{daysRemaining} dias restantes</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600">
                    {season.bonusMultiplier}x XP
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={cn("text-3xl font-black", season.color)}>
                {season.currentLevel}
              </div>
              <p className="text-xs text-muted-foreground">
                de {season.maxLevel}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Próximo nível: {season.xpProgress.toLocaleString()} / {season.xpRequired.toLocaleString()} XP
              </span>
              <span className={cn("font-semibold", season.color)}>
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={progressPercent} 
                className="h-3 bg-muted/50"
              />
              <motion.div
                className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
                style={{ width: `${progressPercent}%` }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Next Reward Preview */}
          {nextReward && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 group-hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{nextReward.icon}</span>
                <div>
                  <p className="text-sm font-medium">{nextReward.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Nível {nextReward.level}
                    {nextReward.premium && (
                      <span className="ml-1.5 text-amber-500">★ Premium</span>
                    )}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </div>
      </Card>

      {/* Details Modal */}
      <SeasonDetailsModal 
        isOpen={showDetails} 
        onClose={() => setShowDetails(false)} 
        season={season}
      />
    </>
  );
});

interface SeasonDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: Season;
}

const SeasonDetailsModal = memo(function SeasonDetailsModal({
  isOpen,
  onClose,
  season,
}: SeasonDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[80vh] overflow-hidden"
        >
          <Card className="flex flex-col h-full">
            {/* Header */}
            <div className={cn(
              "p-6 text-white bg-gradient-to-br",
              season.gradient
            )}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/20">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{season.name}</h2>
                  <p className="text-white/80">
                    Nível {season.currentLevel} de {season.maxLevel}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <Progress 
                  value={(season.xpProgress / season.xpRequired) * 100} 
                  className="h-2 bg-white/20"
                />
                <p className="text-sm text-white/70 mt-2">
                  {season.xpProgress.toLocaleString()} / {season.xpRequired.toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* Rewards Track */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Trilha de Recompensas
              </h3>
              
              <div className="space-y-3">
                {season.rewards.map((reward, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl border transition-colors",
                      reward.claimed 
                        ? "bg-primary/5 border-primary/20" 
                        : reward.level <= season.currentLevel
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-muted/30 border-transparent opacity-60"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                      reward.claimed 
                        ? "bg-primary text-primary-foreground"
                        : reward.level <= season.currentLevel
                          ? "bg-amber-500 text-white"
                          : "bg-muted text-muted-foreground"
                    )}>
                      {reward.level}
                    </div>
                    
                    <span className="text-2xl">{reward.icon}</span>
                    
                    <div className="flex-1">
                      <p className="font-medium">{reward.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {reward.premium && <span className="text-amber-500">★ Premium • </span>}
                        Nível {reward.level}
                      </p>
                    </div>

                    {reward.claimed ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                        Resgatado
                      </span>
                    ) : reward.level <= season.currentLevel ? (
                      <Button size="sm" className="gap-1">
                        <Gift className="w-3 h-3" />
                        Resgatar
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Bloqueado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <Button onClick={onClose} className="w-full">
                Fechar
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export { currentSeason };
export type { Season, SeasonReward };
