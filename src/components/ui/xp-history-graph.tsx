import { memo, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Calendar, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface XPDataPoint {
  date: string;
  xp: number;
  level?: number;
  label?: string;
}

interface XPHistoryGraphProps {
  data?: XPDataPoint[];
  className?: string;
  showLevelMarkers?: boolean;
  height?: number;
}

// Sample data generator
function generateSampleData(): XPDataPoint[] {
  const data: XPDataPoint[] = [];
  let xp = 0;
  const today = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random daily XP gain
    const dailyXP = Math.floor(Math.random() * 300) + 50;
    xp += dailyXP;
    
    // Calculate level
    const level = Math.floor(xp / 1000) + 1;

    data.push({
      date: date.toISOString().split("T")[0],
      xp,
      level,
      label: date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" }),
    });
  }

  return data;
}

type Period = "7d" | "30d" | "90d" | "all";

export const XPHistoryGraph = memo(function XPHistoryGraph({
  data,
  className,
  showLevelMarkers = true,
  height = 300,
}: XPHistoryGraphProps) {
  const [period, setPeriod] = useState<Period>("30d");
  const [hoveredPoint, setHoveredPoint] = useState<XPDataPoint | null>(null);

  // Use provided data or generate sample
  const chartData = useMemo(() => {
    const sourceData = data || generateSampleData();
    
    switch (period) {
      case "7d":
        return sourceData.slice(-7);
      case "30d":
        return sourceData.slice(-30);
      case "90d":
        return sourceData.slice(-90);
      default:
        return sourceData;
    }
  }, [data, period]);

  // Calculate stats
  const stats = useMemo(() => {
    if (chartData.length < 2) {
      return { change: 0, percentChange: 0, trend: "neutral" as const, avgDaily: 0 };
    }

    const firstXP = chartData[0].xp;
    const lastXP = chartData[chartData.length - 1].xp;
    const change = lastXP - firstXP;
    const percentChange = ((change / firstXP) * 100).toFixed(1);
    const avgDaily = Math.round(change / chartData.length);

    return {
      change,
      percentChange: parseFloat(percentChange),
      trend: change > 0 ? "up" as const : change < 0 ? "down" as const : "neutral" as const,
      avgDaily,
    };
  }, [chartData]);

  // Find level up points
  const levelUpPoints = useMemo(() => {
    const points: number[] = [];
    for (let i = 1; i < chartData.length; i++) {
      if (chartData[i].level && chartData[i - 1].level && 
          chartData[i].level! > chartData[i - 1].level!) {
        points.push(chartData[i].xp);
      }
    }
    return points;
  }, [chartData]);

  const TrendIcon = stats.trend === "up" ? TrendingUp : stats.trend === "down" ? TrendingDown : Minus;
  const trendColor = stats.trend === "up" ? "text-green-500" : stats.trend === "down" ? "text-red-500" : "text-muted-foreground";

  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Histórico de XP
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <TrendIcon className={cn("h-4 w-4", trendColor)} />
            <span className={cn("text-sm font-medium", trendColor)}>
              {stats.change >= 0 ? "+" : ""}{stats.change.toLocaleString()} XP
              <span className="text-muted-foreground ml-1">
                ({stats.percentChange >= 0 ? "+" : ""}{stats.percentChange}%)
              </span>
            </span>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {(["7d", "30d", "90d", "all"] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "ghost"}
              size="sm"
              onClick={() => setPeriod(p)}
              className="text-xs"
            >
              {p === "all" ? "Tudo" : p.replace("d", " dias")}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
        >
          <div className="text-xs text-muted-foreground mb-1">XP Total</div>
          <div className="text-lg font-bold text-primary">
            {chartData[chartData.length - 1]?.xp.toLocaleString()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20"
        >
          <div className="text-xs text-muted-foreground mb-1">Média Diária</div>
          <div className="text-lg font-bold text-green-500">
            +{stats.avgDaily.toLocaleString()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20"
        >
          <div className="text-xs text-muted-foreground mb-1">Nível Atual</div>
          <div className="text-lg font-bold text-purple-500">
            Lv. {chartData[chartData.length - 1]?.level || 1}
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onMouseMove={(e) => {
              if (e.activePayload?.[0]) {
                setHoveredPoint(e.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.[0]) {
                  const data = payload[0].payload as XPDataPoint;
                  return (
                    <div className="bg-popover border rounded-lg p-3 shadow-lg">
                      <div className="text-sm font-medium">{data.label}</div>
                      <div className="text-lg font-bold text-primary">
                        {data.xp.toLocaleString()} XP
                      </div>
                      {data.level && (
                        <div className="text-xs text-muted-foreground">
                          Nível {data.level}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Level up markers */}
            {showLevelMarkers && levelUpPoints.map((xp, i) => (
              <ReferenceLine
                key={i}
                y={xp}
                stroke="hsl(var(--primary))"
                strokeDasharray="5 5"
                opacity={0.5}
              />
            ))}
            
            <Area
              type="monotone"
              dataKey="xp"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#xpGradient)"
              dot={false}
              activeDot={{
                r: 6,
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Hovered point info */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 rounded-lg bg-muted/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{hoveredPoint.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">XP: </span>
                <span className="font-bold text-primary">{hoveredPoint.xp.toLocaleString()}</span>
              </div>
              {hoveredPoint.level && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Nível: </span>
                  <span className="font-bold">{hoveredPoint.level}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Mini version for sidebars
export const MiniXPHistoryGraph = memo(function MiniXPHistoryGraph({
  data,
  className,
}: {
  data?: XPDataPoint[];
  className?: string;
}) {
  const chartData = useMemo(() => {
    return (data || generateSampleData()).slice(-7);
  }, [data]);

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">XP Semanal</span>
        <Zap className="h-4 w-4 text-yellow-500" />
      </div>
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="miniXpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="xp"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#miniXpGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        Últimos 7 dias
      </div>
    </div>
  );
});
