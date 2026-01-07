import { memo, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  Users,
  TrendingUp,
  Award,
  Target,
  Zap,
  Medal,
  Crown,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UserStats {
  xp: number;
  level: number;
  quests: number;
  achievements: number;
  streak: number;
  coins: number;
}

interface ComparativeData {
  category: string;
  you: number;
  average: number;
  top10: number;
}

interface ComparativeStatsProps {
  userStats?: UserStats;
  averageStats?: UserStats;
  top10Stats?: UserStats;
  className?: string;
}

// Sample data generator
function generateStats(): UserStats {
  return {
    xp: Math.floor(Math.random() * 10000) + 1000,
    level: Math.floor(Math.random() * 20) + 1,
    quests: Math.floor(Math.random() * 100) + 10,
    achievements: Math.floor(Math.random() * 50) + 5,
    streak: Math.floor(Math.random() * 30),
    coins: Math.floor(Math.random() * 5000) + 500,
  };
}

type ViewMode = "bars" | "radar" | "detailed";

export const ComparativeStats = memo(function ComparativeStats({
  userStats,
  averageStats,
  top10Stats,
  className,
}: ComparativeStatsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("bars");

  // Generate or use provided stats
  const user = useMemo(() => userStats || generateStats(), [userStats]);
  const average = useMemo(() => averageStats || generateStats(), [averageStats]);
  const top10 = useMemo(() => top10Stats || {
    xp: average.xp * 2.5,
    level: average.level * 2,
    quests: average.quests * 2.5,
    achievements: average.achievements * 3,
    streak: average.streak * 2,
    coins: average.coins * 3,
  }, [top10Stats, average]);

  // Prepare chart data
  const chartData: ComparativeData[] = useMemo(() => [
    { category: "XP", you: user.xp, average: average.xp, top10: top10.xp },
    { category: "Nível", you: user.level * 500, average: average.level * 500, top10: top10.level * 500 },
    { category: "Missões", you: user.quests * 100, average: average.quests * 100, top10: top10.quests * 100 },
    { category: "Conquistas", you: user.achievements * 200, average: average.achievements * 200, top10: top10.achievements * 200 },
    { category: "Sequência", you: user.streak * 100, average: average.streak * 100, top10: top10.streak * 100 },
  ], [user, average, top10]);

  // Radar chart data
  const radarData = useMemo(() => {
    const maxValues = {
      xp: Math.max(user.xp, average.xp, top10.xp),
      level: Math.max(user.level, average.level, top10.level),
      quests: Math.max(user.quests, average.quests, top10.quests),
      achievements: Math.max(user.achievements, average.achievements, top10.achievements),
      streak: Math.max(user.streak, average.streak, top10.streak),
    };

    return [
      {
        subject: "XP",
        Você: (user.xp / maxValues.xp) * 100,
        Média: (average.xp / maxValues.xp) * 100,
        "Top 10%": (top10.xp / maxValues.xp) * 100,
      },
      {
        subject: "Nível",
        Você: (user.level / maxValues.level) * 100,
        Média: (average.level / maxValues.level) * 100,
        "Top 10%": (top10.level / maxValues.level) * 100,
      },
      {
        subject: "Missões",
        Você: (user.quests / maxValues.quests) * 100,
        Média: (average.quests / maxValues.quests) * 100,
        "Top 10%": (top10.quests / maxValues.quests) * 100,
      },
      {
        subject: "Conquistas",
        Você: (user.achievements / maxValues.achievements) * 100,
        Média: (average.achievements / maxValues.achievements) * 100,
        "Top 10%": (top10.achievements / maxValues.achievements) * 100,
      },
      {
        subject: "Sequência",
        Você: (user.streak / maxValues.streak) * 100,
        Média: (average.streak / maxValues.streak) * 100,
        "Top 10%": (top10.streak / maxValues.streak) * 100,
      },
    ];
  }, [user, average, top10]);

  // Calculate percentiles
  const percentiles = useMemo(() => {
    const calculate = (userVal: number, avgVal: number, topVal: number) => {
      if (userVal >= topVal) return 100;
      if (userVal <= avgVal * 0.5) return 25;
      if (userVal <= avgVal) return 50;
      const range = topVal - avgVal;
      const position = userVal - avgVal;
      return Math.min(99, Math.round(50 + (position / range) * 40));
    };

    return {
      xp: calculate(user.xp, average.xp, top10.xp),
      level: calculate(user.level, average.level, top10.level),
      quests: calculate(user.quests, average.quests, top10.quests),
      achievements: calculate(user.achievements, average.achievements, top10.achievements),
      streak: calculate(user.streak, average.streak, top10.streak),
    };
  }, [user, average, top10]);

  const overallPercentile = Math.round(
    Object.values(percentiles).reduce((a, b) => a + b, 0) / Object.keys(percentiles).length
  );

  const getTrendIcon = (userVal: number, avgVal: number) => {
    if (userVal > avgVal * 1.1) return { Icon: ArrowUp, color: "text-green-500" };
    if (userVal < avgVal * 0.9) return { Icon: ArrowDown, color: "text-red-500" };
    return { Icon: Minus, color: "text-muted-foreground" };
  };

  return (
    <div className={cn("rounded-xl border bg-card", className)}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Comparação de Performance
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Veja como você se compara com outros colaboradores
            </p>
          </div>

          {/* Overall percentile badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-bold",
              overallPercentile >= 90 && "bg-yellow-500/20 text-yellow-600",
              overallPercentile >= 75 && overallPercentile < 90 && "bg-purple-500/20 text-purple-600",
              overallPercentile >= 50 && overallPercentile < 75 && "bg-blue-500/20 text-blue-600",
              overallPercentile < 50 && "bg-muted text-muted-foreground"
            )}
          >
            {overallPercentile >= 90 && <Crown className="h-5 w-5" />}
            {overallPercentile >= 75 && overallPercentile < 90 && <Medal className="h-5 w-5" />}
            {overallPercentile >= 50 && overallPercentile < 75 && <Award className="h-5 w-5" />}
            Top {100 - overallPercentile}%
          </motion.div>
        </div>

        {/* View mode toggle */}
        <div className="flex gap-1 mt-4 p-1 rounded-lg bg-muted w-fit">
          {(["bars", "radar", "detailed"] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="text-xs"
            >
              {mode === "bars" && "Barras"}
              {mode === "radar" && "Radar"}
              {mode === "detailed" && "Detalhado"}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {viewMode === "bars" && (
            <motion.div
              key="bars"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="category" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload) {
                        return (
                          <div className="bg-popover border rounded-lg p-3 shadow-lg">
                            <div className="font-medium mb-2">{label}</div>
                            {payload.map((entry: { name: string; value: number; color: string }) => (
                              <div key={entry.name} className="flex items-center gap-2 text-sm">
                                <div
                                  className="w-3 h-3 rounded"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span>{entry.name}:</span>
                                <span className="font-bold">{entry.value.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="you" name="Você" fill="hsl(var(--primary))" radius={4} />
                  <Bar dataKey="average" name="Média" fill="hsl(var(--muted-foreground))" radius={4} />
                  <Bar dataKey="top10" name="Top 10%" fill="hsl(45 93% 47%)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {viewMode === "radar" && (
            <motion.div
              key="radar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--muted))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Você"
                    dataKey="Você"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Média"
                    dataKey="Média"
                    stroke="hsl(var(--muted-foreground))"
                    fill="hsl(var(--muted-foreground))"
                    fillOpacity={0.1}
                  />
                  <Radar
                    name="Top 10%"
                    dataKey="Top 10%"
                    stroke="hsl(45 93% 47%)"
                    fill="hsl(45 93% 47%)"
                    fillOpacity={0.1}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {viewMode === "detailed" && (
            <motion.div
              key="detailed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[
                { key: "xp", label: "Experiência", icon: Zap, user: user.xp, avg: average.xp, top: top10.xp },
                { key: "level", label: "Nível", icon: Award, user: user.level, avg: average.level, top: top10.level },
                { key: "quests", label: "Missões", icon: Target, user: user.quests, avg: average.quests, top: top10.quests },
                { key: "achievements", label: "Conquistas", icon: Medal, user: user.achievements, avg: average.achievements, top: top10.achievements },
                { key: "streak", label: "Sequência", icon: TrendingUp, user: user.streak, avg: average.streak, top: top10.streak },
              ].map((stat, i) => {
                const percentile = percentiles[stat.key as keyof typeof percentiles];
                const trend = getTrendIcon(stat.user, stat.avg);
                
                return (
                  <motion.div
                    key={stat.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-lg border bg-card/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <stat.icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{stat.label}</span>
                        <trend.Icon className={cn("h-4 w-4", trend.color)} />
                      </div>
                      <span className={cn(
                        "text-sm font-bold px-2 py-0.5 rounded-full",
                        percentile >= 75 && "bg-green-500/20 text-green-600",
                        percentile >= 50 && percentile < 75 && "bg-blue-500/20 text-blue-600",
                        percentile < 50 && "bg-muted text-muted-foreground"
                      )}>
                        Top {100 - percentile}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">Você</div>
                        <div className="font-bold text-primary">{stat.user.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Média</div>
                        <div className="font-medium">{stat.avg.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Top 10%</div>
                        <div className="font-medium text-yellow-600">{stat.top.toLocaleString()}</div>
                      </div>
                    </div>

                    <Progress value={percentile} className="h-2" />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

// Compact version for sidebars
export const MiniComparativeStats = memo(function MiniComparativeStats({
  className,
}: {
  className?: string;
}) {
  const percentile = 73; // Example

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Seu Ranking</span>
        <Users className="h-4 w-4 text-primary" />
      </div>

      <div className="flex items-center gap-3">
        <div className={cn(
          "text-2xl font-bold",
          percentile >= 75 && "text-green-500",
          percentile >= 50 && percentile < 75 && "text-blue-500",
          percentile < 50 && "text-muted-foreground"
        )}>
          Top {100 - percentile}%
        </div>
        <div className="flex-1">
          <Progress value={percentile} className="h-2" />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Você está à frente de {percentile}% dos colaboradores
      </p>
    </div>
  );
});
