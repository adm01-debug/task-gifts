import { memo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown,
  Zap, 
  Star,
  Trophy,
  Target,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface WeeklyStat {
  label: string;
  value: number;
  previousValue: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

interface WeeklyReportProps {
  className?: string;
}

const weeklyStats: WeeklyStat[] = [
  { label: "XP Ganho", value: 2850, previousValue: 2100, unit: "", icon: <Zap className="h-4 w-4" />, color: "text-yellow-500" },
  { label: "Tarefas", value: 34, previousValue: 28, unit: "", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-500" },
  { label: "Streak", value: 7, previousValue: 5, unit: "dias", icon: <Flame className="h-4 w-4" />, color: "text-orange-500" },
  { label: "Conquistas", value: 3, previousValue: 1, unit: "", icon: <Trophy className="h-4 w-4" />, color: "text-purple-500" },
];

const dailyXP = [
  { day: "Seg", xp: 450, target: 400 },
  { day: "Ter", xp: 380, target: 400 },
  { day: "Qua", xp: 520, target: 400 },
  { day: "Qui", xp: 410, target: 400 },
  { day: "Sex", xp: 490, target: 400 },
  { day: "Sáb", xp: 300, target: 400 },
  { day: "Dom", xp: 300, target: 400 },
];

const highlights = [
  { type: "achievement", title: "Conquistou 'Mestre das Tarefas'", xp: 500 },
  { type: "streak", title: "7 dias de streak alcançado", xp: 200 },
  { type: "quest", title: "Completou Quest Semanal", xp: 350 },
];

export const WeeklyReport = memo(function WeeklyReport({ className }: WeeklyReportProps) {
  const maxDailyXP = Math.max(...dailyXP.map(d => d.xp));
  const totalWeeklyXP = dailyXP.reduce((acc, d) => acc + d.xp, 0);
  const avgDailyXP = Math.round(totalWeeklyXP / 7);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span>Relatório Semanal</span>
              <p className="text-xs font-normal text-muted-foreground">
                6 - 12 Jan, 2025
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            +35%
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {weeklyStats.map((stat, index) => {
            const change = ((stat.value - stat.previousValue) / stat.previousValue) * 100;
            const isPositive = change > 0;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-xl bg-muted/50 border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={stat.color}>{stat.icon}</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] px-1.5",
                      isPositive ? "text-green-500 border-green-500/30" : "text-red-500 border-red-500/30"
                    )}
                  >
                    {isPositive ? <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" />}
                    {Math.abs(Math.round(change))}%
                  </Badge>
                </div>
                <p className="text-xl font-bold">
                  {stat.value.toLocaleString()}
                  {stat.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Daily XP Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              XP Diário
            </h4>
            <span className="text-xs text-muted-foreground">
              Média: {avgDailyXP} XP/dia
            </span>
          </div>

          <div className="flex items-end gap-2 h-24">
            {dailyXP.map((day, index) => {
              const height = (day.xp / maxDailyXP) * 100;
              const hitTarget = day.xp >= day.target;

              return (
                <motion.div
                  key={day.day}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div 
                    className={cn(
                      "w-full rounded-t-lg transition-all",
                      hitTarget 
                        ? "bg-gradient-to-t from-green-500 to-emerald-400" 
                        : "bg-gradient-to-t from-muted to-muted-foreground/20"
                    )}
                    style={{ height: "100%" }}
                  />
                  <span className="text-[10px] text-muted-foreground">{day.day}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Target Line Reference */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-green-500 to-emerald-400" />
            <span>Meta atingida (400+ XP)</span>
          </div>
        </div>

        {/* Weekly Highlights */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Destaques da Semana
          </h4>

          <div className="space-y-2">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    highlight.type === "achievement" 
                      ? "bg-purple-500/20 text-purple-500"
                      : highlight.type === "streak"
                        ? "bg-orange-500/20 text-orange-500"
                        : "bg-blue-500/20 text-blue-500"
                  )}>
                    {highlight.type === "achievement" ? (
                      <Award className="h-4 w-4" />
                    ) : highlight.type === "streak" ? (
                      <Flame className="h-4 w-4" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-sm">{highlight.title}</span>
                </div>
                <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                  +{highlight.xp} XP
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Meta Semanal
            </h4>
            <span className="text-sm font-bold text-primary">85%</span>
          </div>
          <Progress value={85} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            2.850 / 3.500 XP - Faltam 650 XP para completar
          </p>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-lg font-bold">+750</span>
            </div>
            <p className="text-xs text-muted-foreground">XP vs semana anterior</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-lg font-bold">24h</span>
            </div>
            <p className="text-xs text-muted-foreground">Tempo produtivo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
