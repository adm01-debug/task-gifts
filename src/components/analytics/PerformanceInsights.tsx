import React, { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, TrendingUp, TrendingDown, Zap, Star, Trophy,
  Calendar, Target, Users, Clock, Activity, Award, Flame
} from "lucide-react";

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  icon: React.ElementType;
  color: string;
}

interface WeeklyData {
  day: string;
  xp: number;
  tasks: number;
}

const metrics: PerformanceMetric[] = [
  { id: "1", name: "XP Total", value: 12450, previousValue: 10200, target: 15000, unit: "XP", icon: Zap, color: "text-amber-500" },
  { id: "2", name: "Tarefas", value: 42, previousValue: 38, target: 50, unit: "tarefas", icon: Target, color: "text-blue-500" },
  { id: "3", name: "Streak", value: 15, previousValue: 12, target: 30, unit: "dias", icon: Flame, color: "text-orange-500" },
  { id: "4", name: "Conquistas", value: 28, previousValue: 24, target: 50, unit: "badges", icon: Trophy, color: "text-purple-500" }
];

const weeklyData: WeeklyData[] = [
  { day: "Seg", xp: 450, tasks: 8 },
  { day: "Ter", xp: 380, tasks: 6 },
  { day: "Qua", xp: 520, tasks: 9 },
  { day: "Qui", xp: 410, tasks: 7 },
  { day: "Sex", xp: 600, tasks: 11 },
  { day: "Sáb", xp: 150, tasks: 3 },
  { day: "Dom", xp: 80, tasks: 2 }
];

const MetricCard = memo(({ metric }: { metric: PerformanceMetric }) => {
  const Icon = metric.icon;
  const change = metric.value - metric.previousValue;
  const changePercent = Math.round((change / metric.previousValue) * 100);
  const progress = (metric.value / metric.target) * 100;
  const isPositive = change >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-card border hover:bg-accent/30 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-muted`}>
          <Icon className={`h-5 w-5 ${metric.color}`} />
        </div>
        <div className={`flex items-center gap-1 text-xs ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositive ? "+" : ""}{changePercent}%
        </div>
      </div>
      
      <div className="space-y-1">
        <h4 className="text-xs text-muted-foreground">{metric.name}</h4>
        <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
        <div className="flex items-center gap-2">
          <Progress value={Math.min(progress, 100)} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Meta: {metric.target.toLocaleString()} {metric.unit}
        </p>
      </div>
    </motion.div>
  );
});

MetricCard.displayName = "MetricCard";

const WeeklyChart = memo(({ data }: { data: WeeklyData[] }) => {
  const maxXp = Math.max(...data.map(d => d.xp));
  
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-1 h-32">
        {data.map((day, idx) => (
          <motion.div
            key={day.day}
            initial={{ height: 0 }}
            animate={{ height: `${(day.xp / maxXp) * 100}%` }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="flex-1 bg-primary/80 rounded-t-md relative group cursor-pointer hover:bg-primary transition-colors"
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-popover text-popover-foreground text-xs rounded-lg px-2 py-1.5 shadow-lg border whitespace-nowrap">
                <div className="font-medium">{day.xp} XP</div>
                <div className="text-muted-foreground">{day.tasks} tarefas</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        {data.map(day => (
          <span key={day.day} className="flex-1 text-center">{day.day}</span>
        ))}
      </div>
    </div>
  );
});

WeeklyChart.displayName = "WeeklyChart";

const PerformanceInsights = memo(({ className }: { className?: string }) => {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  
  const totalXp = useMemo(() => weeklyData.reduce((sum, d) => sum + d.xp, 0), []);
  const totalTasks = useMemo(() => weeklyData.reduce((sum, d) => sum + d.tasks, 0), []);
  const avgDaily = useMemo(() => Math.round(totalXp / 7), [totalXp]);
  
  const insights = useMemo(() => [
    { text: "Sexta-feira foi seu dia mais produtivo", icon: Trophy, positive: true },
    { text: "Você está 22% acima da média da equipe", icon: TrendingUp, positive: true },
    { text: "Faltam 5 dias para bater seu recorde de streak", icon: Flame, positive: true },
    { text: "Complete 8 tarefas hoje para manter a média", icon: Target, positive: false }
  ], []);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Performance</CardTitle>
              <p className="text-xs text-muted-foreground">
                Suas métricas de desempenho
              </p>
            </div>
          </div>
          
          <div className="flex gap-1">
            {(["week", "month", "year"] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPeriod(p)}
              >
                {p === "week" ? "Semana" : p === "month" ? "Mês" : "Ano"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/50">
          <div className="text-center">
            <div className="text-xl font-bold text-primary">{totalXp.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">XP Total</div>
          </div>
          <div className="text-center border-x border-border">
            <div className="text-xl font-bold text-blue-500">{totalTasks}</div>
            <div className="text-xs text-muted-foreground">Tarefas</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-500">{avgDaily}</div>
            <div className="text-xs text-muted-foreground">XP/dia</div>
          </div>
        </div>
        
        {/* Weekly Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3">XP por Dia</h4>
          <WeeklyChart data={weeklyData} />
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
        
        {/* Insights */}
        <div>
          <h4 className="text-sm font-medium mb-3">Insights</h4>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`
                  flex items-center gap-2 p-2 rounded-lg text-sm
                  ${insight.positive 
                    ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}
                `}
              >
                <insight.icon className="h-4 w-4 shrink-0" />
                <span>{insight.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Comparison */}
        <div className="p-3 rounded-lg border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">vs. Média da Equipe</span>
          </div>
          <Badge className="bg-green-500/20 text-green-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            +22%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});

PerformanceInsights.displayName = "PerformanceInsights";

export { PerformanceInsights };
