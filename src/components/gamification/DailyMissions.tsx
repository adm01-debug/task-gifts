import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Target, 
  Gift, 
  Clock, 
  CheckCircle2, 
  Star,
  Zap,
  Trophy,
  Sparkles,
  ChevronRight,
  Flame
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "daily" | "weekly" | "special";
  xpReward: number;
  coinReward: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  expiresIn: string;
  difficulty: "easy" | "medium" | "hard";
}

const mockMissions: Mission[] = [
  {
    id: "1",
    title: "Primeira Tarefa do Dia",
    description: "Complete sua primeira tarefa hoje",
    icon: <CheckCircle2 className="h-5 w-5" />,
    type: "daily",
    xpReward: 50,
    coinReward: 25,
    progress: 1,
    target: 1,
    completed: true,
    claimed: false,
    expiresIn: "23h",
    difficulty: "easy",
  },
  {
    id: "2",
    title: "Produtividade em Alta",
    description: "Complete 5 tarefas em um único dia",
    icon: <Zap className="h-5 w-5" />,
    type: "daily",
    xpReward: 150,
    coinReward: 75,
    progress: 3,
    target: 5,
    completed: false,
    claimed: false,
    expiresIn: "23h",
    difficulty: "medium",
  },
  {
    id: "3",
    title: "Colaborador do Dia",
    description: "Envie 3 kudos para colegas",
    icon: <Star className="h-5 w-5" />,
    type: "daily",
    xpReward: 100,
    coinReward: 50,
    progress: 2,
    target: 3,
    completed: false,
    claimed: false,
    expiresIn: "23h",
    difficulty: "easy",
  },
  {
    id: "4",
    title: "Mestre do Conhecimento",
    description: "Complete um módulo de treinamento",
    icon: <Trophy className="h-5 w-5" />,
    type: "weekly",
    xpReward: 300,
    coinReward: 150,
    progress: 0,
    target: 1,
    completed: false,
    claimed: false,
    expiresIn: "5d",
    difficulty: "hard",
  },
  {
    id: "5",
    title: "Missão Especial: Evento Sazonal",
    description: "Participe do evento de gamificação",
    icon: <Sparkles className="h-5 w-5" />,
    type: "special",
    xpReward: 500,
    coinReward: 250,
    progress: 1,
    target: 3,
    completed: false,
    claimed: false,
    expiresIn: "2d",
    difficulty: "hard",
  },
];

const difficultyConfig = {
  easy: { label: "Fácil", color: "text-green-500", bg: "bg-green-500/10" },
  medium: { label: "Médio", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  hard: { label: "Difícil", color: "text-red-500", bg: "bg-red-500/10" },
};

const typeConfig = {
  daily: { label: "Diária", color: "bg-blue-500", icon: Calendar },
  weekly: { label: "Semanal", color: "bg-purple-500", icon: Target },
  special: { label: "Especial", color: "bg-gradient-to-r from-amber-500 to-orange-500", icon: Sparkles },
};

export const DailyMissions = memo(function DailyMissions() {
  const [missions, setMissions] = useState(mockMissions);
  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "special">("all");

  const filteredMissions = missions.filter(m => filter === "all" || m.type === filter);
  const completedCount = missions.filter(m => m.completed).length;
  const claimableCount = missions.filter(m => m.completed && !m.claimed).length;

  const handleClaim = (missionId: string) => {
    setMissions(prev => prev.map(m => 
      m.id === missionId ? { ...m, claimed: true } : m
    ));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span>Missões do Dia</span>
              <p className="text-xs font-normal text-muted-foreground">
                {completedCount}/{missions.length} completadas
              </p>
            </div>
          </CardTitle>
          {claimableCount > 0 && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse">
              <Gift className="h-3 w-3 mr-1" />
              {claimableCount} recompensas
            </Badge>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          {(["all", "daily", "weekly", "special"] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(type)}
              className="text-xs"
            >
              {type === "all" ? "Todas" : typeConfig[type].label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredMissions.map((mission, index) => {
            const progress = (mission.progress / mission.target) * 100;
            const TypeIcon = typeConfig[mission.type].icon;

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  mission.claimed 
                    ? "bg-muted/50 opacity-60" 
                    : mission.completed 
                      ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30"
                      : "bg-card hover:bg-accent/50"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    mission.completed 
                      ? "bg-green-500/20 text-green-500"
                      : "bg-primary/10 text-primary"
                  )}>
                    {mission.completed ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      mission.icon
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn(
                        "font-medium text-sm truncate",
                        mission.claimed && "line-through"
                      )}>
                        {mission.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={cn("text-[10px] shrink-0", typeConfig[mission.type].color, "text-white")}
                      >
                        <TypeIcon className="h-2.5 w-2.5 mr-1" />
                        {typeConfig[mission.type].label}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      {mission.description}
                    </p>

                    {/* Progress */}
                    {!mission.completed && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {mission.progress}/{mission.target}
                          </span>
                          <span className={cn("flex items-center gap-1", difficultyConfig[mission.difficulty].color)}>
                            <Flame className="h-3 w-3" />
                            {difficultyConfig[mission.difficulty].label}
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}

                    {/* Rewards & Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Zap className="h-3.5 w-3.5" />
                          +{mission.xpReward} XP
                        </span>
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3.5 w-3.5" />
                          +{mission.coinReward}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {mission.expiresIn}
                        </span>
                      </div>

                      {mission.completed && !mission.claimed && (
                        <Button
                          size="sm"
                          onClick={() => handleClaim(mission.id)}
                          className="h-7 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        >
                          <Gift className="h-3 w-3 mr-1" />
                          Resgatar
                        </Button>
                      )}

                      {mission.claimed && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Resgatado
                        </Badge>
                      )}

                      {!mission.completed && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Ver <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* All Missions Completed Banner */}
        {completedCount === missions.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center"
          >
            <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold text-green-500">Todas as Missões Completas!</h4>
            <p className="text-xs text-muted-foreground">Volte amanhã para novas missões</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
});
