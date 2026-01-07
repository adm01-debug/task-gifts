import { memo } from "react";
import { motion } from "framer-motion";
import { Timer, Zap, Target, Star, TrendingUp, Clock, CheckCircle2, Play, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SprintGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  xpReward: number;
}

const mockGoals: SprintGoal[] = [
  { id: "1", title: "Tarefas Completadas", target: 10, current: 7, unit: "tarefas", xpReward: 200 },
  { id: "2", title: "Horas Focadas", target: 8, current: 5.5, unit: "horas", xpReward: 150 },
  { id: "3", title: "Reuniões Produtivas", target: 5, current: 3, unit: "reuniões", xpReward: 100 },
];

export const SprintTimer = memo(function SprintTimer() {
  const timeRemaining = { hours: 2, minutes: 45, seconds: 30 };
  const sprintProgress = 68;
  const currentXP = 450;
  const potentialXP = 650;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
            >
              <Timer className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <span className="block">Sprint Ativo</span>
              <span className="text-xs font-normal text-muted-foreground">Sprint Semanal #12</span>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Em Andamento
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">Tempo Restante</p>
          <div className="flex items-center justify-center gap-2 text-4xl font-mono font-bold">
            <motion.span
              key={timeRemaining.hours}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-background/80 px-3 py-1 rounded-lg"
            >
              {String(timeRemaining.hours).padStart(2, "0")}
            </motion.span>
            <span className="text-muted-foreground">:</span>
            <motion.span
              key={timeRemaining.minutes}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-background/80 px-3 py-1 rounded-lg"
            >
              {String(timeRemaining.minutes).padStart(2, "0")}
            </motion.span>
            <span className="text-muted-foreground">:</span>
            <motion.span
              key={timeRemaining.seconds}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-background/80 px-3 py-1 rounded-lg text-2xl"
            >
              {String(timeRemaining.seconds).padStart(2, "0")}
            </motion.span>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <Button size="sm" variant="outline" className="gap-1">
              <Pause className="h-4 w-4" />
              Pausar
            </Button>
            <Button size="sm" className="gap-1">
              <Zap className="h-4 w-4" />
              Boost
            </Button>
          </div>
        </motion.div>

        {/* Sprint Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso do Sprint</span>
            <span className="text-sm text-muted-foreground">{sprintProgress}%</span>
          </div>
          <Progress value={sprintProgress} className="h-3" />
        </div>

        {/* XP Potential */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium">XP Acumulado</p>
                <p className="text-xs text-muted-foreground">Potencial: +{potentialXP} XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-500">{currentXP}</p>
              <p className="text-[10px] text-muted-foreground">de {potentialXP} XP</p>
            </div>
          </div>
        </div>

        {/* Sprint Goals */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Metas do Sprint
          </h4>
          <div className="space-y-2">
            {mockGoals.map((goal, index) => {
              const progress = (goal.current / goal.target) * 100;
              const isComplete = goal.current >= goal.target;
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-3 rounded-xl border",
                    isComplete ? "bg-green-500/5 border-green-500/30" : "bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">{goal.title}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      +{goal.xpReward} XP
                    </Badge>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-1.5 mb-1" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{goal.current}/{goal.target} {goal.unit}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
          <div className="text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <p className="text-lg font-bold">+15%</p>
            <p className="text-[10px] text-muted-foreground">vs anterior</p>
          </div>
          <div className="text-center">
            <Target className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-lg font-bold">2/3</p>
            <p className="text-[10px] text-muted-foreground">metas</p>
          </div>
          <div className="text-center">
            <Zap className="h-4 w-4 mx-auto text-amber-500 mb-1" />
            <p className="text-lg font-bold">1.5x</p>
            <p className="text-[10px] text-muted-foreground">multiplicador</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
