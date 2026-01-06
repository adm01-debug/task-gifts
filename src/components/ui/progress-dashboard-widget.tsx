import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Minus, 
  Zap, Coins, Trophy, Target, 
  Flame, Calendar, CheckCircle2 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
}

interface ProgressWidgetProps {
  level: number;
  currentXP: number;
  requiredXP: number;
  coins: number;
  streak: number;
  completedToday: number;
  totalToday: number;
  weeklyProgress: number[];
}

export function ProgressDashboardWidget({
  level,
  currentXP,
  requiredXP,
  coins,
  streak,
  completedToday,
  totalToday,
  weeklyProgress,
}: ProgressWidgetProps) {
  const xpProgress = (currentXP / requiredXP) * 100;
  const todayProgress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;
  const maxWeekly = Math.max(...weeklyProgress, 1);

  const stats: StatCard[] = [
    {
      label: "Nível",
      value: level,
      icon: <Trophy className="w-5 h-5" />,
      color: "text-amber-500",
    },
    {
      label: "Coins",
      value: coins.toLocaleString(),
      icon: <Coins className="w-5 h-5" />,
      color: "text-yellow-500",
    },
    {
      label: "Streak",
      value: `${streak} dias`,
      icon: <Flame className="w-5 h-5" />,
      color: "text-orange-500",
    },
  ];

  const days = ["S", "T", "Q", "Q", "S", "S", "D"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-5 space-y-5"
    >
      {/* Header with Level Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progresso do Nível</p>
              <p className="font-semibold">Nível {level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{currentXP.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">/ {requiredXP.toLocaleString()} XP</p>
          </div>
        </div>
        
        <div className="relative">
          <Progress value={xpProgress} className="h-3" />
          <motion.div
            className="absolute top-0 left-0 h-full bg-primary/30 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Faltam <span className="font-medium text-foreground">{(requiredXP - currentXP).toLocaleString()} XP</span> para o próximo nível
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-muted/50 rounded-lg p-3 text-center"
          >
            <div className={`inline-flex mb-1 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Today's Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Hoje</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm">
              {completedToday}/{totalToday} tarefas
            </span>
          </div>
        </div>
        <Progress value={todayProgress} className="h-2" />
      </div>

      {/* Weekly Activity Chart */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Atividade Semanal</span>
        </div>
        
        <div className="flex items-end justify-between gap-1 h-16">
          {weeklyProgress.map((value, index) => {
            const height = (value / maxWeekly) * 100;
            const isToday = index === new Date().getDay();
            
            return (
              <motion.div
                key={index}
                className="flex-1 flex flex-col items-center gap-1"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isToday 
                      ? "bg-primary" 
                      : value > 0 
                        ? "bg-primary/40" 
                        : "bg-muted"
                  }`}
                  style={{ height: `${Math.max(height, 8)}%` }}
                />
                <span className={`text-[10px] ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                  {days[index]}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
        <TrendingUp className="w-4 h-4 text-green-500" />
        <span className="text-sm text-muted-foreground">
          +12% comparado à semana passada
        </span>
      </div>
    </motion.div>
  );
}

// Mini version for sidebar/header
export function MiniProgressWidget({
  level,
  currentXP,
  requiredXP,
}: Pick<ProgressWidgetProps, "level" | "currentXP" | "requiredXP">) {
  const progress = (currentXP / requiredXP) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">{level}</span>
        </div>
        <svg className="absolute inset-0 w-10 h-10 -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted"
          />
          <motion.circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary"
            strokeDasharray={`${progress * 1.13} 113`}
            initial={{ strokeDasharray: "0 113" }}
            animate={{ strokeDasharray: `${progress * 1.13} 113` }}
            transition={{ duration: 1 }}
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium truncate">Nível {level}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5 mt-1" />
      </div>
    </div>
  );
}
