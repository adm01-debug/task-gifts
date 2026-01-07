import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Trophy, Star, Flame, Clock, 
  CheckCircle2, Lock, Gift, Zap, Target,
  TrendingUp, Award, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "special";
  category: "learning" | "social" | "productivity" | "wellness";
  difficulty: "easy" | "medium" | "hard" | "epic";
  progress: number;
  target: number;
  xpReward: number;
  coinReward: number;
  bonusReward?: string;
  expiresAt: Date;
  isCompleted: boolean;
  isLocked: boolean;
  icon: string;
  streak?: number;
}

const challenges: Challenge[] = [
  {
    id: "1",
    title: "Maratonista do Conhecimento",
    description: "Complete 5 módulos de treinamento",
    type: "weekly",
    category: "learning",
    difficulty: "medium",
    progress: 3,
    target: 5,
    xpReward: 500,
    coinReward: 100,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isCompleted: false,
    isLocked: false,
    icon: "📚",
    streak: 3
  },
  {
    id: "2",
    title: "Networking Master",
    description: "Envie 10 kudos para colegas",
    type: "weekly",
    category: "social",
    difficulty: "easy",
    progress: 10,
    target: 10,
    xpReward: 300,
    coinReward: 50,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isCompleted: true,
    isLocked: false,
    icon: "🤝"
  },
  {
    id: "3",
    title: "Pontualidade de Ouro",
    description: "Check-in pontual por 7 dias seguidos",
    type: "weekly",
    category: "productivity",
    difficulty: "hard",
    progress: 5,
    target: 7,
    xpReward: 750,
    coinReward: 150,
    bonusReward: "Emblema Exclusivo",
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    isCompleted: false,
    isLocked: false,
    icon: "⏰",
    streak: 5
  },
  {
    id: "4",
    title: "Explorador Épico",
    description: "Complete todos os desafios da semana",
    type: "special",
    category: "productivity",
    difficulty: "epic",
    progress: 2,
    target: 5,
    xpReward: 2000,
    coinReward: 500,
    bonusReward: "Título Lendário",
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isCompleted: false,
    isLocked: false,
    icon: "🏆"
  },
  {
    id: "5",
    title: "Próximo Desafio",
    description: "Desbloqueie completando o anterior",
    type: "weekly",
    category: "learning",
    difficulty: "hard",
    progress: 0,
    target: 10,
    xpReward: 600,
    coinReward: 120,
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    isCompleted: false,
    isLocked: true,
    icon: "🔒"
  }
];

const difficultyConfig = {
  easy: { color: "bg-green-500/20 text-green-600", label: "Fácil", multiplier: 1 },
  medium: { color: "bg-yellow-500/20 text-yellow-600", label: "Médio", multiplier: 1.5 },
  hard: { color: "bg-orange-500/20 text-orange-600", label: "Difícil", multiplier: 2 },
  epic: { color: "bg-purple-500/20 text-purple-600", label: "Épico", multiplier: 3 }
};

const categoryIcons = {
  learning: "📚",
  social: "🤝",
  productivity: "⚡",
  wellness: "🧘"
};

const ChallengeCard: React.FC<{ challenge: Challenge; index: number }> = memo(({ challenge, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const progressPercent = (challenge.progress / challenge.target) * 100;
  const timeLeft = Math.max(0, Math.floor((challenge.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)));
  const daysLeft = Math.floor(timeLeft / 24);
  const hoursLeft = timeLeft % 24;
  
  const diffConfig = difficultyConfig[challenge.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300",
        challenge.isCompleted && "bg-green-500/5 border-green-500/30",
        challenge.isLocked && "opacity-60 bg-muted/30",
        !challenge.isCompleted && !challenge.isLocked && "bg-gradient-to-br from-muted/50 to-transparent hover:shadow-lg hover:border-primary/30"
      )}
    >
      {/* Special/Epic Glow Effect */}
      {challenge.difficulty === "epic" && !challenge.isCompleted && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10"
        />
      )}

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <motion.div
          animate={isHovered ? { scale: 1.1, rotate: [0, -5, 5, 0] } : {}}
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0",
            challenge.isCompleted ? "bg-green-500/20" : "bg-muted"
          )}
        >
          {challenge.isCompleted ? (
            <CheckCircle2 className="h-7 w-7 text-green-500" />
          ) : challenge.isLocked ? (
            <Lock className="h-6 w-6 text-muted-foreground" />
          ) : (
            challenge.icon
          )}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold">{challenge.title}</h4>
                <Badge className={diffConfig.color} variant="secondary">
                  {diffConfig.label}
                </Badge>
                {challenge.type === "special" && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Especial
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
            </div>
          </div>

          {/* Progress */}
          {!challenge.isLocked && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  {challenge.isCompleted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Completo!
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 text-muted-foreground" />
                      {challenge.progress}/{challenge.target}
                    </>
                  )}
                </span>
                {!challenge.isCompleted && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {daysLeft > 0 ? `${daysLeft}d ${hoursLeft}h` : `${hoursLeft}h`}
                  </span>
                )}
              </div>
              <Progress 
                value={progressPercent} 
                className={cn(
                  "h-2",
                  challenge.isCompleted && "[&>div]:bg-green-500"
                )} 
              />
            </div>
          )}

          {/* Rewards */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">+{challenge.xpReward} XP</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-yellow-500">🪙</span>
              <span className="font-medium">+{challenge.coinReward}</span>
            </div>
            {challenge.bonusReward && (
              <Badge variant="outline" className="text-xs">
                <Gift className="h-3 w-3 mr-1" />
                {challenge.bonusReward}
              </Badge>
            )}
            {challenge.streak && challenge.streak > 1 && (
              <Badge className="bg-orange-500/20 text-orange-600">
                <Flame className="h-3 w-3 mr-1" />
                {challenge.streak}x Streak
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        {challenge.isCompleted && (
          <Button size="sm" className="shrink-0 bg-green-500 hover:bg-green-600">
            <Gift className="h-4 w-4 mr-2" />
            Resgatar
          </Button>
        )}
      </div>
    </motion.div>
  );
});

ChallengeCard.displayName = "ChallengeCard";

export const WeeklyChallenges: React.FC<{ className?: string }> = memo(({ className }) => {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  
  const completedCount = challenges.filter(c => c.isCompleted).length;
  const totalXP = challenges.reduce((acc, c) => acc + (c.isCompleted ? c.xpReward : 0), 0);
  
  const filteredChallenges = challenges.filter(c => {
    if (filter === "active") return !c.isCompleted && !c.isLocked;
    if (filter === "completed") return c.isCompleted;
    return true;
  });

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Desafios Semanais
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  Semana 24
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete desafios para ganhar recompensas exclusivas
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { label: "Completos", value: `${completedCount}/${challenges.length}`, icon: CheckCircle2, color: "text-green-500" },
            { label: "XP Ganho", value: `+${totalXP}`, icon: Star, color: "text-yellow-500" },
            { label: "Streak", value: "5 dias", icon: Flame, color: "text-orange-500" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-background/50"
            >
              <stat.icon className={cn("h-5 w-5", stat.color)} />
              <div>
                <div className="font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          {[
            { key: "all", label: "Todos" },
            { key: "active", label: "Ativos" },
            { key: "completed", label: "Completos" }
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
        <AnimatePresence mode="popLayout">
          {filteredChallenges.map((challenge, i) => (
            <ChallengeCard key={challenge.id} challenge={challenge} index={i} />
          ))}
        </AnimatePresence>
        
        {filteredChallenges.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum desafio encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

WeeklyChallenges.displayName = "WeeklyChallenges";
