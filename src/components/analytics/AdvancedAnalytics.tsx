import { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart as RechartsLine,
  Line,
} from "recharts";

// Data types
interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
  color: string;
}

interface ChartData {
  name: string;
  [key: string]: string | number;
}

// Mock data
const engagementData: ChartData[] = [
  { name: "Jan", engajamento: 65, participacao: 78, nps: 42 },
  { name: "Fev", engajamento: 72, participacao: 82, nps: 48 },
  { name: "Mar", engajamento: 68, participacao: 75, nps: 45 },
  { name: "Abr", engajamento: 78, participacao: 88, nps: 52 },
  { name: "Mai", engajamento: 82, participacao: 91, nps: 58 },
  { name: "Jun", engajamento: 85, participacao: 89, nps: 62 },
];

const departmentData: ChartData[] = [
  { name: "Tech", valor: 92 },
  { name: "RH", valor: 88 },
  { name: "Marketing", valor: 76 },
  { name: "Vendas", valor: 84 },
  { name: "Operações", valor: 71 },
];

const distributionData = [
  { name: "Promotores", value: 45, color: "#22c55e" },
  { name: "Neutros", value: 35, color: "#eab308" },
  { name: "Detratores", value: 20, color: "#ef4444" },
];

const COLORS = ["#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444"];

// Metric Card Component
const MetricCardComponent = memo(function MetricCardComponent({
  metric,
}: {
  metric: MetricCard;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)" }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `linear-gradient(135deg, ${metric.color} 0%, transparent 60%)`,
          }}
        />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
              <motion.p
                className="text-3xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={metric.value}
              >
                {metric.value}
              </motion.p>
            </div>
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${metric.color}20` }}
            >
              <div style={{ color: metric.color }}>{metric.icon}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                metric.trend === "up" && "bg-green-100 text-green-700",
                metric.trend === "down" && "bg-red-100 text-red-700"
              )}
            >
              {metric.trend === "up" ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {Math.abs(metric.change)}%
            </Badge>
            <span className="text-xs text-muted-foreground">
              {metric.changeLabel}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Main Component
export const AdvancedAnalytics = memo(function AdvancedAnalytics({
  className,
}: {
  className?: string;
}) {
  const [timeRange, setTimeRange] = useState("6m");
  const [activeChart, setActiveChart] = useState("engagement");

  const metrics: MetricCard[] = useMemo(
    () => [
      {
        id: "engagement",
        title: "Engajamento Geral",
        value: "85%",
        change: 12,
        changeLabel: "vs. mês anterior",
        icon: <Activity className="h-6 w-6" />,
        trend: "up",
        color: "#8b5cf6",
      },
      {
        id: "nps",
        title: "eNPS Score",
        value: "+62",
        change: 8,
        changeLabel: "vs. mês anterior",
        icon: <TrendingUp className="h-6 w-6" />,
        trend: "up",
        color: "#22c55e",
      },
      {
        id: "participation",
        title: "Taxa de Participação",
        value: "91%",
        change: 5,
        changeLabel: "vs. mês anterior",
        icon: <Users className="h-6 w-6" />,
        trend: "up",
        color: "#06b6d4",
      },
      {
        id: "completion",
        title: "Conclusão PDI",
        value: "78%",
        change: -3,
        changeLabel: "vs. mês anterior",
        icon: <Target className="h-6 w-6" />,
        trend: "down",
        color: "#f59e0b",
      },
    ],
    []
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avançado</h2>
          <p className="text-muted-foreground">
            Insights detalhados sobre engajamento e performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Último mês</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricCardComponent metric={metric} />
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tendências de Engajamento</CardTitle>
              <Tabs value={activeChart} onValueChange={setActiveChart}>
                <TabsList className="h-8">
                  <TabsTrigger value="engagement" className="text-xs px-3">
                    <LineChart className="h-3 w-3 mr-1" />
                    Linha
                  </TabsTrigger>
                  <TabsTrigger value="bar" className="text-xs px-3">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Barra
                  </TabsTrigger>
                  <TabsTrigger value="area" className="text-xs px-3">
                    <Activity className="h-3 w-3 mr-1" />
                    Área
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AnimatePresence mode="wait">
                  {activeChart === "engagement" && (
                    <RechartsLine data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="engajamento"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: "#8b5cf6" }}
                        name="Engajamento"
                      />
                      <Line
                        type="monotone"
                        dataKey="participacao"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={{ fill: "#06b6d4" }}
                        name="Participação"
                      />
                      <Line
                        type="monotone"
                        dataKey="nps"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ fill: "#22c55e" }}
                        name="eNPS"
                      />
                    </RechartsLine>
                  )}
                  {activeChart === "bar" && (
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="engajamento" fill="#8b5cf6" name="Engajamento" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="participacao" fill="#06b6d4" name="Participação" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                  {activeChart === "area" && (
                    <AreaChart data={engagementData}>
                      <defs>
                        <linearGradient id="colorEngajamento" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorParticipacao" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="engajamento"
                        stroke="#8b5cf6"
                        fill="url(#colorEngajamento)"
                        name="Engajamento"
                      />
                      <Area
                        type="monotone"
                        dataKey="participacao"
                        stroke="#06b6d4"
                        fill="url(#colorParticipacao)"
                        name="Participação"
                      />
                    </AreaChart>
                  )}
                </AnimatePresence>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição eNPS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-4">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparativo por Departamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentData.map((dept, index) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{dept.name}</span>
                  <span className="text-sm text-muted-foreground">{dept.valor}%</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dept.valor}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="absolute h-full rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-violet-500" />
              </div>
              <h3 className="font-semibold">Insight Rápido</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              O departamento de Tech tem o maior engajamento, com 92% de participação nas últimas pesquisas.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Award className="h-5 w-5 text-cyan-500" />
              </div>
              <h3 className="font-semibold">Destaque</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              eNPS subiu 10 pontos no último trimestre - maior crescimento do ano!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="font-semibold">Atenção</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Conclusão de PDI caiu 3% - considere enviar lembretes aos colaboradores.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default AdvancedAnalytics;
