import { memo } from "react";
import { motion } from "framer-motion";
import { 
  Star, 
  Zap, 
  TrendingUp, 
  Award,
  ChevronRight,
  Sparkles,
  Crown,
  Gift
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LevelReward {
  level: number;
  title: string;
  reward: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  rank: string;
  rankColor: string;
  className?: string;
}

const levelRewards: LevelReward[] = [
  { level: 5, title: "Iniciante", reward: "Badge Exclusivo", icon: <Award className="h-4 w-4" />, unlocked: true },
  { level: 10, title: "Aprendiz", reward: "+500 Moedas", icon: <Star className="h-4 w-4" />, unlocked: true },
  { level: 15, title: "Competente", reward: "Tema Especial", icon: <Sparkles className="h-4 w-4" />, unlocked: false },
  { level: 20, title: "Experiente", reward: "Título Único", icon: <Crown className="h-4 w-4" />, unlocked: false },
  { level: 25, title: "Mestre", reward: "Avatar Lendário", icon: <Gift className="h-4 w-4" />, unlocked: false },
];

export const LevelProgress = memo(function LevelProgress({
  currentLevel = 12,
  currentXP = 2450,
  xpToNextLevel = 3000,
  totalXP = 15450,
  rank = "Competente",
  rankColor = "text-blue-500",
  className,
}: Partial<LevelProgressProps>) {
  const progress = (currentXP / xpToNextLevel) * 100;
  const xpRemaining = xpToNextLevel - currentXP;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-primary-foreground">{currentLevel}</span>
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Star className="h-3.5 w-3.5 text-white fill-white" />
              </motion.div>
            </motion.div>
            <div>
              <span className="text-lg">Nível {currentLevel}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", rankColor)}>
                  <Crown className="h-3 w-3 mr-1" />
                  {rank}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">XP Total</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* XP Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-500" />
              Progresso para Nível {currentLevel + 1}
            </span>
            <span className="font-medium">
              {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
            </span>
          </div>

          <div className="relative">
            <Progress value={progress} className="h-4" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{ width: "30%" }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Faltam <span className="font-medium text-foreground">{xpRemaining.toLocaleString()} XP</span>
            </span>
            <span className="flex items-center gap-1 text-green-500">
              <TrendingUp className="h-3 w-3" />
              +15% esta semana
            </span>
          </div>
        </div>

        {/* Level Milestones */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Marcos de Nível
          </h4>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-3">
              {levelRewards.map((milestone, index) => {
                const isCurrentTarget = milestone.level > currentLevel && 
                  (index === 0 || levelRewards[index - 1].level <= currentLevel);

                return (
                  <motion.div
                    key={milestone.level}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex items-center gap-3 relative pl-2",
                      milestone.unlocked ? "opacity-100" : "opacity-60"
                    )}
                  >
                    {/* Node */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10",
                      milestone.unlocked 
                        ? "bg-gradient-to-br from-primary to-primary/60 text-primary-foreground"
                        : isCurrentTarget
                          ? "bg-primary/20 text-primary border-2 border-primary border-dashed"
                          : "bg-muted text-muted-foreground"
                    )}>
                      {milestone.unlocked ? (
                        milestone.icon
                      ) : (
                        <span className="text-xs font-bold">{milestone.level}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          milestone.unlocked && "text-primary"
                        )}>
                          {milestone.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Nível {milestone.level} • {milestone.reward}
                        </p>
                      </div>

                      {milestone.unlocked ? (
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500">
                          Desbloqueado
                        </Badge>
                      ) : isCurrentTarget ? (
                        <Badge className="text-xs animate-pulse">
                          Próximo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {milestone.level - currentLevel} níveis
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-primary">+1,250</p>
            <p className="text-[10px] text-muted-foreground">XP Hoje</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-green-500">+8,500</p>
            <p className="text-[10px] text-muted-foreground">XP Semana</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-amber-500">3</p>
            <p className="text-[10px] text-muted-foreground">Níveis/Mês</p>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          Ver Histórico Completo
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
});
