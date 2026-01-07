import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Target,
  Info
} from "lucide-react";

interface PerformanceMetric {
  name: string;
  value: number;
  previousValue: number;
  benchmark: number;
  description: string;
}

const performanceData: PerformanceMetric[] = [
  { name: "Produtividade", value: 85, previousValue: 78, benchmark: 80, description: "Entregas no prazo e qualidade" },
  { name: "Colaboração", value: 92, previousValue: 88, benchmark: 75, description: "Trabalho em equipe e comunicação" },
  { name: "Inovação", value: 70, previousValue: 72, benchmark: 70, description: "Novas ideias e melhorias" },
  { name: "Liderança", value: 78, previousValue: 75, benchmark: 65, description: "Influência e desenvolvimento de outros" },
  { name: "Aprendizado", value: 88, previousValue: 82, benchmark: 80, description: "Desenvolvimento contínuo" },
  { name: "Engajamento", value: 95, previousValue: 90, benchmark: 85, description: "Participação e proatividade" }
];

export function PerformanceRadar() {
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null);
  const [showBenchmark, setShowBenchmark] = useState(true);

  const chartData = performanceData.map(metric => ({
    subject: metric.name,
    value: metric.value,
    benchmark: metric.benchmark,
    fullMark: 100
  }));

  const getTrend = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 2) return { icon: TrendingUp, color: "text-green-500", label: `+${diff}%` };
    if (diff < -2) return { icon: TrendingDown, color: "text-red-500", label: `${diff}%` };
    return { icon: Minus, color: "text-muted-foreground", label: "Estável" };
  };

  const averageScore = Math.round(
    performanceData.reduce((sum, m) => sum + m.value, 0) / performanceData.length
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-primary";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Radar de Performance</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visão 360° do seu desempenho
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore}
            </div>
            <div className="text-xs text-muted-foreground">Média Geral</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Radar Chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              
              {showBenchmark && (
                <Radar
                  name="Benchmark"
                  dataKey="benchmark"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted))"
                  fillOpacity={0.3}
                  strokeDasharray="5 5"
                />
              )}
              
              <Radar
                name="Seu Score"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.5}
              />
              
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Seu Score</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 h-auto py-0"
            onClick={() => setShowBenchmark(!showBenchmark)}
          >
            <div className={`w-3 h-3 rounded-full border-2 border-dashed border-muted-foreground ${showBenchmark ? "bg-muted" : ""}`} />
            <span className={showBenchmark ? "" : "text-muted-foreground"}>Benchmark</span>
          </Button>
        </div>

        {/* Metrics Detail */}
        <div className="grid grid-cols-2 gap-2">
          {performanceData.map((metric) => {
            const trend = getTrend(metric.value, metric.previousValue);
            const TrendIcon = trend.icon;
            const isSelected = selectedMetric?.name === metric.name;
            const isAboveBenchmark = metric.value >= metric.benchmark;

            return (
              <motion.button
                key={metric.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMetric(isSelected ? null : metric)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate">{metric.name}</span>
                  <div className={`flex items-center gap-1 text-xs ${trend.color}`}>
                    <TrendIcon className="h-3 w-3" />
                    <span>{trend.label}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className={`text-xl font-bold ${getScoreColor(metric.value)}`}>
                    {metric.value}
                  </span>
                  {isAboveBenchmark ? (
                    <Badge variant="outline" className="text-[10px] border-green-500 text-green-500">
                      <Target className="h-2.5 w-2.5 mr-0.5" />
                      Acima
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-500">
                      <Target className="h-2.5 w-2.5 mr-0.5" />
                      Meta: {metric.benchmark}
                    </Badge>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Metric Detail */}
        {selectedMetric && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-lg bg-muted/50 border"
          >
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium mb-1">{selectedMetric.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedMetric.description}
                </p>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded bg-background">
                    <div className="text-lg font-bold text-primary">{selectedMetric.value}%</div>
                    <div className="text-xs text-muted-foreground">Atual</div>
                  </div>
                  <div className="p-2 rounded bg-background">
                    <div className="text-lg font-bold text-muted-foreground">{selectedMetric.previousValue}%</div>
                    <div className="text-xs text-muted-foreground">Anterior</div>
                  </div>
                  <div className="p-2 rounded bg-background">
                    <div className="text-lg font-bold text-amber-500">{selectedMetric.benchmark}%</div>
                    <div className="text-xs text-muted-foreground">Benchmark</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Performance Summary */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Resumo de Performance</h4>
              <p className="text-sm text-muted-foreground">
                {performanceData.filter(m => m.value >= m.benchmark).length} de {performanceData.length} métricas acima do benchmark
              </p>
            </div>
            <div className="flex gap-1">
              {performanceData.map((metric, i) => (
                <div 
                  key={i}
                  className={`w-2 h-6 rounded-full ${
                    metric.value >= metric.benchmark ? "bg-green-500" : "bg-amber-500"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
