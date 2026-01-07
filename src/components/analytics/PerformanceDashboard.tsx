import { memo, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, TrendingUp, TrendingDown, BarChart3,
  Users, Target, Clock, Zap, Star, Award
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface WeekData {
  day: string;
  xp: number;
  tasks: number;
  focus: number;
}

const mockMetrics: PerformanceMetric[] = [
  { id: "xp", name: "XP Semanal", value: 2450, previousValue: 2100, target: 3000, unit: "XP", icon: Zap, color: "text-yellow-500" },
  { id: "tasks", name: "Tarefas Concluídas", value: 28, previousValue: 24, target: 35, unit: "", icon: Target, color: "text-green-500" },
  { id: "focus", name: "Tempo Focado", value: 32, previousValue: 28, target: 40, unit: "h", icon: Clock, color: "text-blue-500" },
  { id: "collab", name: "Colaborações", value: 15, previousValue: 12, target: 20, unit: "", icon: Users, color: "text-purple-500" }
];

const mockWeekData: WeekData[] = [
  { day: "Seg", xp: 420, tasks: 5, focus: 6 },
  { day: "Ter", xp: 380, tasks: 4, focus: 5 },
  { day: "Qua", xp: 510, tasks: 6, focus: 7 },
  { day: "Qui", xp: 290, tasks: 3, focus: 4 },
  { day: "Sex", xp: 450, tasks: 5, focus: 5 },
  { day: "Sáb", xp: 200, tasks: 2, focus: 3 },
  { day: "Dom", xp: 200, tasks: 3, focus: 2 }
];

const MetricCard = memo(function MetricCard({ metric }: { metric: PerformanceMetric }) {
  const Icon = metric.icon;
  const change = metric.value - metric.previousValue;
  const changePercent = ((change / metric.previousValue) * 100).toFixed(1);
  const progress = (metric.value / metric.target) * 100;
  const isPositive = change >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-xl border bg-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-lg bg-muted")}>
          <Icon className={cn("w-5 h-5", metric.color)} />
        </div>
        <Badge 
          variant="secondary" 
          className={cn(
            "text-xs",
            isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}
        >
          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {isPositive ? "+" : ""}{changePercent}%
        </Badge>
      </div>

      <div className="mb-2">
        <p className="text-2xl font-bold">
          {metric.value.toLocaleString()}{metric.unit}
        </p>
        <p className="text-xs text-muted-foreground">{metric.name}</p>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Meta: {metric.target}{metric.unit}</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={Math.min(progress, 100)} className="h-1.5" />
      </div>
    </motion.div>
  );
});

const SimpleBarChart = memo(function SimpleBarChart({ 
  data, 
  dataKey,
  color 
}: { 
  data: WeekData[];
  dataKey: keyof WeekData;
  color: string;
}) {
  const maxValue = Math.max(...data.map(d => d[dataKey] as number));

  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((d, idx) => {
        const value = d[dataKey] as number;
        const height = (value / maxValue) * 100;
        
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className={cn("w-full rounded-t-md", color)}
            />
            <span className="text-[10px] text-muted-foreground">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
});

export const PerformanceDashboard = memo(function PerformanceDashboard({ 
  className 
}: { 
  className?: string;
}) {
  const [weekData] = useState(mockWeekData);
  const [metrics] = useState(mockMetrics);

  const weeklyStats = useMemo(() => ({
    totalXp: weekData.reduce((sum, d) => sum + d.xp, 0),
    totalTasks: weekData.reduce((sum, d) => sum + d.tasks, 0),
    totalFocus: weekData.reduce((sum, d) => sum + d.focus, 0),
    avgXp: Math.round(weekData.reduce((sum, d) => sum + d.xp, 0) / 7),
    bestDay: weekData.reduce((best, d) => d.xp > best.xp ? d : best, weekData[0])
  }), [weekData]);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Performance Semanal</CardTitle>
              <p className="text-xs text-muted-foreground">
                Semana atual • Melhor dia: {weeklyStats.bestDay.day}
              </p>
            </div>
          </div>

          <Badge variant="secondary">
            <Star className="w-3 h-3 mr-1 text-yellow-500" />
            {weeklyStats.totalXp.toLocaleString()} XP
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map(metric => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Charts */}
        <Tabs defaultValue="xp">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="xp" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              XP
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="focus" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Foco
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp" className="mt-4">
            <SimpleBarChart data={weekData} dataKey="xp" color="bg-yellow-500" />
            <div className="flex justify-between mt-3 text-xs">
              <span className="text-muted-foreground">Total: {weeklyStats.totalXp} XP</span>
              <span className="text-muted-foreground">Média: {weeklyStats.avgXp} XP/dia</span>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <SimpleBarChart data={weekData} dataKey="tasks" color="bg-green-500" />
            <div className="flex justify-between mt-3 text-xs">
              <span className="text-muted-foreground">Total: {weeklyStats.totalTasks} tarefas</span>
              <span className="text-muted-foreground">Média: {(weeklyStats.totalTasks / 7).toFixed(1)}/dia</span>
            </div>
          </TabsContent>

          <TabsContent value="focus" className="mt-4">
            <SimpleBarChart data={weekData} dataKey="focus" color="bg-blue-500" />
            <div className="flex justify-between mt-3 text-xs">
              <span className="text-muted-foreground">Total: {weeklyStats.totalFocus}h</span>
              <span className="text-muted-foreground">Média: {(weeklyStats.totalFocus / 7).toFixed(1)}h/dia</span>
            </div>
          </TabsContent>
        </Tabs>

        {/* Achievements Preview */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Próxima conquista</p>
                <p className="text-xs text-muted-foreground">Complete 30 tarefas esta semana</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{weeklyStats.totalTasks}/30</p>
              <Progress value={(weeklyStats.totalTasks / 30) * 100} className="h-1 w-16 mt-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default PerformanceDashboard;
