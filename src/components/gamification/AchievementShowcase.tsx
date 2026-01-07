import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Star, Crown, Medal, Award, Shield,
  Flame, Zap, Heart, Target, Sparkles, Lock,
  ChevronRight, Share2, Eye, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  category: string;
  xpReward: number;
  coinReward: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  isSecret?: boolean;
}

const achievements: Achievement[] = [
  { id: "1", name: "Primeiro Passo", description: "Complete seu primeiro módulo de treinamento", icon: "🎯", rarity: "common", category: "Aprendizado", xpReward: 100, coinReward: 25, unlockedAt: new Date("2024-01-15") },
  { id: "2", name: "Maratonista", description: "Complete 50 módulos de treinamento", icon: "📚", rarity: "rare", category: "Aprendizado", xpReward: 500, coinReward: 100, progress: 35, maxProgress: 50 },
  { id: "3", name: "Pontualidade Perfeita", description: "30 dias consecutivos de check-in pontual", icon: "⏰", rarity: "epic", category: "Produtividade", xpReward: 1000, coinReward: 250, unlockedAt: new Date("2024-02-20") },
  { id: "4", name: "Mentor Supremo", description: "Ajude 100 colegas com feedback construtivo", icon: "🌟", rarity: "legendary", category: "Social", xpReward: 2000, coinReward: 500, progress: 78, maxProgress: 100 },
  { id: "5", name: "Networker", description: "Conecte-se com 25 colegas de departamentos diferentes", icon: "🤝", rarity: "uncommon", category: "Social", xpReward: 250, coinReward: 50, unlockedAt: new Date("2024-01-25") },
  { id: "6", name: "Inovador", description: "Sugira 10 melhorias implementadas", icon: "💡", rarity: "rare", category: "Inovação", xpReward: 750, coinReward: 150, progress: 6, maxProgress: 10 },
  { id: "7", name: "Lenda Viva", description: "???", icon: "👑", rarity: "legendary", category: "Secreto", xpReward: 5000, coinReward: 1000, isSecret: true, progress: 0, maxProgress: 1 },
  { id: "8", name: "Velocista", description: "Complete 5 tarefas em um único dia", icon: "⚡", rarity: "uncommon", category: "Produtividade", xpReward: 200, coinReward: 40, unlockedAt: new Date("2024-02-10") },
];

const rarityConfig = {
  common: { 
    label: "Comum", 
    color: "text-gray-500", 
    bg: "bg-gray-500/10", 
    border: "border-gray-500/30",
    gradient: "from-gray-400 to-gray-600"
  },
  uncommon: { 
    label: "Incomum", 
    color: "text-green-500", 
    bg: "bg-green-500/10", 
    border: "border-green-500/30",
    gradient: "from-green-400 to-green-600"
  },
  rare: { 
    label: "Raro", 
    color: "text-blue-500", 
    bg: "bg-blue-500/10", 
    border: "border-blue-500/30",
    gradient: "from-blue-400 to-blue-600"
  },
  epic: { 
    label: "Épico", 
    color: "text-purple-500", 
    bg: "bg-purple-500/10", 
    border: "border-purple-500/30",
    gradient: "from-purple-400 to-purple-600"
  },
  legendary: { 
    label: "Lendário", 
    color: "text-yellow-500", 
    bg: "bg-yellow-500/10", 
    border: "border-yellow-500/30",
    gradient: "from-yellow-400 via-orange-500 to-red-500"
  }
};

const AchievementCard: React.FC<{ 
  achievement: Achievement; 
  index: number;
  onSelect: (a: Achievement) => void;
}> = memo(({ achievement, index, onSelect }) => {
  const isUnlocked = !!achievement.unlockedAt;
  const isInProgress = !isUnlocked && achievement.progress !== undefined;
  const config = rarityConfig[achievement.rarity];
  const progressPercent = achievement.maxProgress 
    ? (achievement.progress || 0) / achievement.maxProgress * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(achievement)}
      className={cn(
        "relative p-4 rounded-xl border cursor-pointer transition-all duration-300",
        isUnlocked && config.bg,
        isUnlocked && config.border,
        !isUnlocked && "bg-muted/30 border-muted",
        achievement.rarity === "legendary" && isUnlocked && "ring-2 ring-yellow-500/50"
      )}
    >
      {/* Legendary Shimmer */}
      {achievement.rarity === "legendary" && isUnlocked && (
        <motion.div
          animate={{ 
            background: [
              "linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.1) 50%, transparent 100%)",
              "linear-gradient(90deg, transparent 100%, rgba(255,215,0,0.1) 150%, transparent 200%)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-xl"
        />
      )}

      <div className="relative flex items-center gap-3">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
          isUnlocked ? `bg-gradient-to-br ${config.gradient}` : "bg-muted"
        )}>
          {achievement.isSecret && !isUnlocked ? (
            <Lock className="h-5 w-5 text-muted-foreground" />
          ) : (
            <span className={!isUnlocked ? "opacity-50 grayscale" : ""}>
              {achievement.icon}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-semibold truncate",
              !isUnlocked && "text-muted-foreground"
            )}>
              {achievement.isSecret && !isUnlocked ? "???" : achievement.name}
            </span>
            <Badge className={cn("shrink-0", config.bg, config.color)} variant="secondary">
              {config.label}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {achievement.isSecret && !isUnlocked 
              ? "Conquista secreta - continue jogando para descobrir!"
              : achievement.description
            }
          </p>

          {isInProgress && (
            <div className="mt-2">
              <Progress value={progressPercent} className="h-1.5" />
              <span className="text-xs text-muted-foreground">
                {achievement.progress}/{achievement.maxProgress}
              </span>
            </div>
          )}
        </div>

        {/* Unlock Date / Rewards */}
        {isUnlocked ? (
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {achievement.unlockedAt?.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </div>
          </div>
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        )}
      </div>
    </motion.div>
  );
});

AchievementCard.displayName = "AchievementCard";

const AchievementDetailModal: React.FC<{
  achievement: Achievement | null;
  onClose: () => void;
}> = ({ achievement, onClose }) => {
  if (!achievement) return null;
  
  const isUnlocked = !!achievement.unlockedAt;
  const config = rarityConfig[achievement.rarity];

  return (
    <Dialog open={!!achievement} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{achievement.icon}</span>
            {achievement.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className={cn(
            "p-6 rounded-xl text-center",
            config.bg
          )}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ type: "spring", duration: 0.5 }}
              className={cn(
                "w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl mb-4",
                `bg-gradient-to-br ${config.gradient}`
              )}
            >
              {achievement.icon}
            </motion.div>
            
            <Badge className={cn(config.bg, config.color)} variant="secondary">
              {config.label}
            </Badge>
            
            <p className="mt-4 text-muted-foreground">{achievement.description}</p>
            
            <div className="flex justify-center gap-4 mt-4">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold">{achievement.xpReward}</span>
                </div>
                <span className="text-xs text-muted-foreground">XP</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <span className="text-yellow-500">🪙</span>
                  <span className="font-bold">{achievement.coinReward}</span>
                </div>
                <span className="text-xs text-muted-foreground">Coins</span>
              </div>
            </div>
          </div>

          {isUnlocked ? (
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-600">Desbloqueado!</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {achievement.unlockedAt?.toLocaleDateString("pt-BR")}
              </span>
            </div>
          ) : achievement.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{achievement.progress}/{achievement.maxProgress}</span>
              </div>
              <Progress value={(achievement.progress / (achievement.maxProgress || 1)) * 100} />
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            {isUnlocked && (
              <Button className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Exibir no Perfil
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AchievementShowcase: React.FC<{ className?: string }> = memo(({ className }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalXP = achievements.filter(a => a.unlockedAt).reduce((acc, a) => acc + a.xpReward, 0);

  const filteredAchievements = achievements.filter(a => {
    if (filter === "unlocked") return !!a.unlockedAt;
    if (filter === "locked") return !a.unlockedAt;
    return true;
  });

  return (
    <>
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Conquistas</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {unlockedCount}/{achievements.length} desbloqueadas • {totalXP.toLocaleString()} XP
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {[
              { key: "all", label: "Todas" },
              { key: "unlocked", label: "Desbloqueadas" },
              { key: "locked", label: "Bloqueadas" }
            ].map(f => (
              <Button
                key={f.key}
                size="sm"
                variant={filter === f.key ? "default" : "outline"}
                onClick={() => setFilter(f.key as typeof filter)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {filteredAchievements.map((achievement, i) => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
              index={i}
              onSelect={setSelectedAchievement}
            />
          ))}
        </CardContent>
      </Card>

      <AchievementDetailModal 
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </>
  );
});

AchievementShowcase.displayName = "AchievementShowcase";
