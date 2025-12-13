import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Radar as RadarIcon, TrendingUp } from "lucide-react";
import { useCompetencies } from "@/hooks/useCompetencies";
import { Skeleton } from "@/components/ui/skeleton";

interface CompetencyRadarProps {
  userId: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold flex items-center gap-2">
          <span>{data.icon}</span>
          {data.area}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="text-primary font-bold">{data.value}</span> / {data.maxValue} pontos
        </p>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            style={{ width: `${(data.value / data.maxValue) * 100}%` }}
          />
        </div>
      </div>
    );
  }
  return null;
};

export function CompetencyRadar({ userId }: CompetencyRadarProps) {
  const { data: competencies, isLoading } = useCompetencies(userId);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="w-full h-[300px] rounded-xl" />
      </div>
    );
  }

  const chartData = competencies?.map(c => ({
    ...c,
    fullMark: c.maxValue,
  })) || [];

  const avgScore = competencies && competencies.length > 0
    ? Math.round(competencies.reduce((acc, c) => acc + c.value, 0) / competencies.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <RadarIcon className="w-5 h-5 text-secondary" />
          Radar de Competências
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-muted-foreground">Média:</span>
          <span className="font-bold text-primary">{avgScore}%</span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid 
              stroke="hsl(var(--border))" 
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="area"
              tick={{ 
                fill: "hsl(var(--muted-foreground))", 
                fontSize: 11,
                fontWeight: 500
              }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickCount={5}
              axisLine={false}
            />
            <Radar
              name="Competências"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "hsl(var(--secondary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Competency breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
        {competencies?.map((comp, i) => (
          <motion.div
            key={comp.area}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="text-lg">{comp.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{comp.area}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(comp.value / comp.maxValue) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                    className={`h-full rounded-full ${
                      comp.value >= 75 ? 'bg-success' :
                      comp.value >= 50 ? 'bg-secondary' :
                      comp.value >= 25 ? 'bg-warning' : 'bg-destructive'
                    }`}
                  />
                </div>
                <span className="text-xs font-semibold w-8 text-right">{comp.value}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
