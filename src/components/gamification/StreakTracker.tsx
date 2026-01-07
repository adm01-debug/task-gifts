import { memo } from "react";
import { motion } from "framer-motion";
import { 
  Flame, 
  Calendar, 
  Trophy, 
  Zap,
  Shield,
  Gift,
  Star,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DayStatus {
  date: string;
  dayName: string;
  completed: boolean;
  isToday: boolean;
  bonus?: number;
}

interface StreakTrackerProps {
  currentStreak: number;
  bestStreak: number;
  freezesAvailable: number;
  weeklyData: DayStatus[];
  className?: string;
}

const defaultWeeklyData: DayStatus[] = [
  { date: "06", dayName: "Seg", completed: true, isToday: false },
  { date: "07", dayName: "Ter", completed: true, isToday: false },
  { date: "08", dayName: "Qua", completed: true, isToday: false, bonus: 50 },
  { date: "09", dayName: "Qui", completed: true, isToday: false },
  { date: "10", dayName: "Sex", completed: true, isToday: false },
  { date: "11", dayName: "Sáb", completed: false, isToday: false },
  { date: "12", dayName: "Dom", completed: false, isToday: true },
];

const streakMilestones = [
  { days: 7, reward: 100, label: "1 Semana" },
  { days: 14, reward: 250, label: "2 Semanas" },
  { days: 30, reward: 500, label: "1 Mês" },
  { days: 60, reward: 1000, label: "2 Meses" },
  { days: 100, reward: 2500, label: "100 Dias" },
];

export const StreakTracker = memo(function StreakTracker({
  currentStreak = 5,
  bestStreak = 23,
  freezesAvailable = 2,
  weeklyData = defaultWeeklyData,
  className,
}: Partial<StreakTrackerProps>) {
  const nextMilestone = streakMilestones.find(m => m.days > currentStreak);
  const daysToMilestone = nextMilestone ? nextMilestone.days - currentStreak : 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Flame className="h-7 w-7 text-white" />
              </div>
              {currentStreak >= 7 && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </motion.div>
              )}
            </motion.div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-orange-500">{currentStreak}</span>
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              <p className="text-xs text-muted-foreground">Streak Atual</p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 justify-end">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">{bestStreak} dias</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Recorde</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Weekly Calendar */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Esta Semana
          </h4>

          <div className="grid grid-cols-7 gap-2">
            {weeklyData.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <div className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center transition-all",
                  day.completed 
                    ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md"
                    : day.isToday
                      ? "bg-primary/10 border-2 border-primary border-dashed"
                      : "bg-muted text-muted-foreground"
                )}>
                  <span className="text-[10px] font-medium opacity-80">{day.dayName}</span>
                  <span className="text-sm font-bold">{day.date}</span>
                  {day.completed && <Flame className="h-3 w-3 mt-0.5" />}
                </div>

                {day.bonus && (
                  <Badge className="absolute -top-1.5 -right-1.5 text-[8px] px-1 py-0 bg-yellow-500">
                    +{day.bonus}
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Streak Freezes */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Proteção de Streak</p>
              <p className="text-xs text-muted-foreground">
                {freezesAvailable} disponíveis
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="text-xs">
            Usar
          </Button>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Gift className="h-4 w-4 text-purple-500" />
                Próximo Marco
              </span>
              <span className="font-medium">
                {nextMilestone.label} ({daysToMilestone} dias restantes)
              </span>
            </div>

            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStreak / nextMilestone.days) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{currentStreak} dias</span>
              <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                <Zap className="h-3 w-3 mr-1" />
                +{nextMilestone.reward} XP
              </Badge>
              <span>{nextMilestone.days} dias</span>
            </div>
          </div>
        )}

        {/* Milestones Overview */}
        <div className="pt-3 border-t">
          <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5" />
            Marcos de Streak
          </h4>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {streakMilestones.map((milestone) => {
              const achieved = currentStreak >= milestone.days;
              return (
                <motion.div
                  key={milestone.days}
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl min-w-[80px] transition-all",
                    achieved 
                      ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                      : "bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                    achieved ? "bg-amber-500 text-white" : "bg-muted-foreground/20"
                  )}>
                    {achieved ? (
                      <Trophy className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{milestone.days}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium",
                    achieved ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {milestone.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    +{milestone.reward} XP
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Total Acumulado</span>
            </div>
            <p className="text-lg font-bold text-green-500">+2,350 XP</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Multiplicador</span>
            </div>
            <p className="text-lg font-bold text-purple-500">1.5x</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
