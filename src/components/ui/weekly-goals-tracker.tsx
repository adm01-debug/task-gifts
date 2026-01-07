import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Target, CheckCircle2, Circle, Flame, Trophy, 
  ChevronRight, Sparkles, Calendar, TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WeeklyGoal {
  id: string;
  title: string;
  description?: string;
  target: number;
  current: number;
  unit: string;
  icon: React.ElementType;
  category: "xp" | "quests" | "learning" | "social" | "attendance";
  xpReward: number;
}

interface WeeklyGoalsTrackerProps {
  goals?: WeeklyGoal[];
  daysRemaining?: number;
  className?: string;
}

const defaultGoals: WeeklyGoal[] = [
  {
    id: "1",
    title: "Ganhar XP",
    description: "Acumule XP completando atividades",
    target: 1000,
    current: 750,
    unit: "XP",
    icon: Flame,
    category: "xp",
    xpReward: 200,
  },
  {
    id: "2",
    title: "Completar Missões",
    description: "Finalize missões diárias",
    target: 7,
    current: 5,
    unit: "missões",
    icon: Target,
    category: "quests",
    xpReward: 150,
  },
  {
    id: "3",
    title: "Horas de Aprendizado",
    description: "Estude nas trilhas de conhecimento",
    target: 5,
    current: 3,
    unit: "horas",
    icon: TrendingUp,
    category: "learning",
    xpReward: 100,
  },
  {
    id: "4",
    title: "Dias Pontuais",
    description: "Registre ponto no horário",
    target: 5,
    current: 4,
    unit: "dias",
    icon: Calendar,
    category: "attendance",
    xpReward: 100,
  },
];

const categoryColors = {
  xp: "from-orange-500 to-red-500",
  quests: "from-blue-500 to-indigo-500",
  learning: "from-green-500 to-emerald-500",
  social: "from-pink-500 to-rose-500",
  attendance: "from-purple-500 to-violet-500",
};

/**
 * WeeklyGoalsTracker - Track weekly goals with progress visualization
 */
export function WeeklyGoalsTracker({
  goals = defaultGoals,
  daysRemaining = 3,
  className,
}: WeeklyGoalsTrackerProps) {
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const completedGoals = goals.filter(g => g.current >= g.target).length;
  const totalProgress = goals.reduce((acc, g) => acc + Math.min(g.current / g.target, 1), 0) / goals.length * 100;
  const totalXPReward = goals.reduce((acc, g) => g.current >= g.target ? acc + g.xpReward : acc, 0);
  const potentialXP = goals.reduce((acc, g) => acc + g.xpReward, 0);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-5 h-5 text-amber-500" />
            Metas Semanais
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{daysRemaining} dias restantes</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Progresso Geral</p>
                <p className="text-xs text-muted-foreground">
                  {completedGoals}/{goals.length} metas completas
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{Math.round(totalProgress)}%</p>
              <p className="text-[10px] text-muted-foreground">
                {totalXPReward}/{potentialXP} XP
              </p>
            </div>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>

        {/* Goals List */}
        <div className="space-y-2">
          {goals.map((goal, index) => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            const isCompleted = goal.current >= goal.target;
            const isExpanded = expandedGoal === goal.id;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                  isCompleted 
                    ? "bg-green-500/5 border-green-500/20" 
                    : "bg-card border-border hover:border-primary/30"
                )}
                onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <motion.div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isCompleted 
                        ? "bg-green-500" 
                        : `bg-gradient-to-br ${categoryColors[goal.category]}`
                    )}
                    animate={isCompleted ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <goal.icon className="w-5 h-5 text-white" />
                    )}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={cn(
                        "text-sm font-medium truncate",
                        isCompleted && "text-green-600 dark:text-green-400"
                      )}>
                        {goal.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-bold">{goal.current}</span>
                        <span className="text-muted-foreground">/ {goal.target}</span>
                        <span className="text-muted-foreground">{goal.unit}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full",
                          isCompleted 
                            ? "bg-green-500" 
                            : `bg-gradient-to-r ${categoryColors[goal.category]}`
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* XP Reward */}
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    isCompleted 
                      ? "bg-green-500/10 text-green-600" 
                      : "bg-primary/10 text-primary"
                  )}>
                    <Flame className="w-3 h-3" />
                    <span>+{goal.xpReward}</span>
                  </div>

                  <ChevronRight className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && goal.description && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                        {goal.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Completion bonus */}
        {completedGoals === goals.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <span className="font-bold text-amber-600 dark:text-amber-400">
                Todas as metas completas!
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Você ganhou um bônus de <span className="font-bold text-primary">+500 XP</span> 🎉
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * MiniWeeklyProgress - Compact version for sidebars/headers
 */
export function MiniWeeklyProgress({
  goals = defaultGoals,
  className,
}: Pick<WeeklyGoalsTrackerProps, "goals" | "className">) {
  const completedGoals = goals.filter(g => g.current >= g.target).length;
  const totalProgress = goals.reduce((acc, g) => acc + Math.min(g.current / g.target, 1), 0) / goals.length * 100;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex -space-x-1">
        {goals.slice(0, 4).map((goal, i) => {
          const isCompleted = goal.current >= goal.target;
          return (
            <div
              key={goal.id}
              className={cn(
                "w-6 h-6 rounded-full border-2 border-background flex items-center justify-center",
                isCompleted 
                  ? "bg-green-500" 
                  : `bg-gradient-to-br ${categoryColors[goal.category]}`
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3 h-3 text-white" />
              ) : (
                <Circle className="w-3 h-3 text-white/50" />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-xs">
        <span className="font-bold">{completedGoals}/{goals.length}</span>
        <span className="text-muted-foreground ml-1">metas</span>
      </div>
    </div>
  );
}
