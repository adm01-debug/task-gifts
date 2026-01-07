import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Zap, ArrowRight, Clock, Star, Trophy, 
  Target, BookOpen, Users, Flame 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Mission {
  id: string;
  title: string;
  description: string;
  type: "quest" | "goal" | "learning" | "social" | "streak";
  xpReward: number;
  coinReward: number;
  progress: number;
  deadline?: string;
  priority: "high" | "medium" | "low";
}

const missionTypeConfig = {
  quest: { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  goal: { icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
  learning: { icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  social: { icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  streak: { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
};

interface NextMissionHighlightProps {
  className?: string;
}

export const NextMissionHighlight = memo(function NextMissionHighlight({ 
  className 
}: NextMissionHighlightProps) {
  // Simular próxima missão prioritária
  const nextMission: Mission = useMemo(() => ({
    id: "1",
    title: "Complete o Quiz Diário",
    description: "Responda 5 perguntas para ganhar XP bônus e manter sua sequência",
    type: "quest",
    xpReward: 150,
    coinReward: 25,
    progress: 60,
    deadline: "Hoje às 23:59",
    priority: "high",
  }), []);

  const config = missionTypeConfig[nextMission.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      <Card 
        className={cn(
          "relative overflow-hidden border-2 border-primary/20",
          "bg-gradient-to-br from-primary/5 via-background to-primary/10",
          "hover:border-primary/40 transition-all duration-300",
          "shadow-lg shadow-primary/5"
        )}
      >
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className={cn(
                  "p-2 rounded-xl",
                  config.bg
                )}
              >
                <Icon className={cn("w-5 h-5", config.color)} />
              </motion.div>
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Sua Próxima Missão
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    Prioridade Alta
                  </span>
                </div>
              </div>
            </div>

            {nextMission.deadline && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                <span>{nextMission.deadline}</span>
              </div>
            )}
          </div>

          {/* Mission Content */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {nextMission.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {nextMission.description}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-semibold text-foreground">
                  {nextMission.progress}%
                </span>
              </div>
              <Progress 
                value={nextMission.progress} 
                className="h-2 bg-muted/50"
              />
            </div>

            {/* Rewards & CTA */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-foreground">
                    +{nextMission.xpReward} XP
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-foreground">
                    +{nextMission.coinReward}
                  </span>
                </div>
              </div>

              <Button 
                size="sm" 
                className="gap-2 group shadow-md"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Animated border */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${nextMission.progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </Card>
    </motion.div>
  );
});
