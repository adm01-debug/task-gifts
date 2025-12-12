import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  Award,
  AlertTriangle,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for charts
const completionTrendData = [
  { month: "Jan", completed: 45, started: 62, abandoned: 8 },
  { month: "Fev", completed: 52, started: 70, abandoned: 12 },
  { month: "Mar", completed: 61, started: 78, abandoned: 9 },
  { month: "Abr", completed: 58, started: 82, abandoned: 15 },
  { month: "Mai", completed: 72, started: 88, abandoned: 7 },
  { month: "Jun", completed: 85, started: 95, abandoned: 5 },
];

const departmentPerformance = [
  { name: "Tecnologia", completion: 92, avgTime: 4.2, engagement: 88 },
  { name: "Vendas", completion: 78, avgTime: 5.8, engagement: 72 },
  { name: "Marketing", completion: 95, avgTime: 3.5, engagement: 91 },
  { name: "RH", completion: 88, avgTime: 4.0, engagement: 85 },
  { name: "Financeiro", completion: 82, avgTime: 4.8, engagement: 79 },
];

const questDifficultyData = [
  { name: "Fácil", value: 35, color: "#10b981" },
  { name: "Médio", value: 45, color: "#f59e0b" },
  { name: "Difícil", value: 15, color: "#f97316" },
  { name: "Expert", value: 5, color: "#ef4444" },
];

const weeklyEngagement = [
  { day: "Seg", hours: 2.4, quests: 12 },
  { day: "Ter", hours: 3.1, quests: 18 },
  { day: "Qua", hours: 2.8, quests: 15 },
  { day: "Qui", hours: 3.5, quests: 22 },
  { day: "Sex", hours: 2.2, quests: 10 },
  { day: "Sáb", hours: 0.8, quests: 4 },
  { day: "Dom", hours: 0.5, quests: 2 },
];

const topQuests = [
  { name: "Onboarding Completo", completions: 145, avgTime: "2.5h", rating: 4.8 },
  { name: "Segurança da Informação", completions: 132, avgTime: "1.8h", rating: 4.6 },
  { name: "Cultura Organizacional", completions: 128, avgTime: "1.2h", rating: 4.9 },
  { name: "Compliance LGPD", completions: 98, avgTime: "3.0h", rating: 4.4 },
  { name: "Liderança Básica", completions: 67, avgTime: "4.5h", rating: 4.7 },
];

const strugglingAreas = [
  { name: "Programação Avançada", dropRate: 42, avgAttempts: 3.2, difficulty: "Expert" },
  { name: "Análise de Dados", dropRate: 35, avgAttempts: 2.8, difficulty: "Difícil" },
  { name: "Gestão de Projetos", dropRate: 28, avgAttempts: 2.1, difficulty: "Médio" },
  { name: "Excel Avançado", dropRate: 25, avgAttempts: 1.9, difficulty: "Médio" },
];

// Stat Card Component
const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  change,
  changeType,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Card className="relative overflow-hidden p-5 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent" 
           style={{ background: `linear-gradient(135deg, ${color}10 0%, transparent 50%)` }} />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          {change && (
            <div
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                changeType === "positive"
                  ? "bg-green-500/10 text-green-400"
                  : changeType === "negative"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {changeType === "positive" ? (
                <TrendingUp className="w-3 h-3" />
              ) : changeType === "negative" ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              {change}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subValue && <p className="text-sm text-muted-foreground mt-0.5">{subValue}</p>}
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

// Chart Card wrapper
const ChartCard = ({
  title,
  subtitle,
  children,
  action,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  </motion.div>
);

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function EngagementReports() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("6m");

  // Calculate ROI metrics
  const totalTrainingHours = 1247;
  const avgCompletionRate = 84;
  const totalCertifications = 456;
  const engagementScore = 87;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Relatórios de Engajamento</h1>
                <p className="text-sm text-muted-foreground">
                  Métricas e ROI do treinamento corporativo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-36">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">Último mês</SelectItem>
                  <SelectItem value="3m">Últimos 3 meses</SelectItem>
                  <SelectItem value="6m">Últimos 6 meses</SelectItem>
                  <SelectItem value="1y">Último ano</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Clock}
            label="Horas de Treinamento"
            value={totalTrainingHours.toLocaleString()}
            subValue="horas investidas"
            change="+18%"
            changeType="positive"
            color="#6366f1"
            delay={0}
          />
          <StatCard
            icon={Target}
            label="Taxa de Conclusão"
            value={`${avgCompletionRate}%`}
            subValue="média geral"
            change="+12%"
            changeType="positive"
            color="#10b981"
            delay={0.1}
          />
          <StatCard
            icon={Award}
            label="Certificações Emitidas"
            value={totalCertifications.toString()}
            subValue="no período"
            change="+24%"
            changeType="positive"
            color="#f59e0b"
            delay={0.2}
          />
          <StatCard
            icon={Activity}
            label="Score de Engajamento"
            value={`${engagementScore}/100`}
            subValue="excelente"
            change="+5pts"
            changeType="positive"
            color="#8b5cf6"
            delay={0.3}
          />
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="departments" className="gap-2">
              <Users className="h-4 w-4" />
              Por Departamento
            </TabsTrigger>
            <TabsTrigger value="difficulty" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Áreas Críticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Completion Trend */}
              <ChartCard
                title="Tendência de Conclusões"
                subtitle="Quests completadas vs iniciadas"
                delay={0.1}
              >
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={completionTrendData}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorStarted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="started"
                        name="Iniciadas"
                        stroke="#6366f1"
                        fillOpacity={1}
                        fill="url(#colorStarted)"
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        name="Completadas"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Weekly Engagement */}
              <ChartCard
                title="Engajamento Semanal"
                subtitle="Distribuição por dia da semana"
                delay={0.2}
              >
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyEngagement}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="hours" name="Horas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="quests" name="Quests" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Top Quests Table */}
            <ChartCard title="Quests Mais Populares" subtitle="Ranking por conclusões" delay={0.3}>
              <div className="space-y-3">
                {topQuests.map((quest, index) => (
                  <motion.div
                    key={quest.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{quest.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Tempo médio: {quest.avgTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{quest.completions}</p>
                      <p className="text-xs text-muted-foreground">conclusões</p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                      ★ {quest.rating}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </ChartCard>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Department Performance Chart */}
              <div className="lg:col-span-2">
                <ChartCard
                  title="Performance por Departamento"
                  subtitle="Taxa de conclusão comparativa"
                  delay={0.1}
                >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="completion" name="Conclusão %" fill="#10b981" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="engagement" name="Engajamento" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                </ChartCard>
              </div>

              {/* Difficulty Distribution */}
              <ChartCard title="Distribuição por Dificuldade" delay={0.2}>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={questDifficultyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {questDifficultyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {questDifficultyData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>

            {/* Department Details */}
            <ChartCard title="Detalhes por Departamento" delay={0.3}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentPerformance.map((dept, index) => (
                  <motion.div
                    key={dept.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <Card className="p-4 bg-muted/30 border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-foreground">{dept.name}</h4>
                        <Badge
                          variant="outline"
                          className={
                            dept.completion >= 90
                              ? "bg-green-500/10 text-green-400 border-green-500/30"
                              : dept.completion >= 80
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }
                        >
                          {dept.completion}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Conclusão</span>
                            <span className="text-foreground">{dept.completion}%</span>
                          </div>
                          <Progress value={dept.completion} className="h-2" />
                        </div>
                        <div className="flex justify-between text-sm pt-2">
                          <span className="text-muted-foreground">Tempo médio</span>
                          <span className="text-foreground">{dept.avgTime}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Engajamento</span>
                          <span className="text-foreground">{dept.engagement}%</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ChartCard>
          </TabsContent>

          <TabsContent value="difficulty" className="space-y-6">
            {/* Alert for struggling areas */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4 bg-amber-500/10 border-amber-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-400">Áreas que Precisam de Atenção</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {strugglingAreas.length} trilhas com taxa de abandono acima de 25%. Considere revisar o conteúdo ou oferecer suporte adicional.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Struggling Areas Table */}
            <ChartCard
              title="Trilhas com Maior Taxa de Abandono"
              subtitle="Áreas que precisam de revisão"
              delay={0.1}
            >
              <div className="space-y-3">
                {strugglingAreas.map((area, index) => (
                  <motion.div
                    key={area.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border-l-4 border-red-500"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{area.name}</p>
                        <Badge
                          variant="outline"
                          className={
                            area.difficulty === "Expert"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : area.difficulty === "Difícil"
                              ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                          }
                        >
                          {area.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Média de {area.avgAttempts} tentativas por usuário
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-400">{area.dropRate}%</p>
                      <p className="text-xs text-muted-foreground">taxa de abandono</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Analisar
                    </Button>
                  </motion.div>
                ))}
              </div>
            </ChartCard>

            {/* Recommendations */}
            <ChartCard title="Recomendações de Melhoria" delay={0.3}>
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-lg bg-green-500/10 border border-green-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-green-500/20">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <h4 className="font-medium text-green-400">Dividir em Módulos</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trilhas com mais de 3 horas têm 40% mais abandono. Considere dividir em módulos menores.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-blue-500/20">
                      <Award className="w-4 h-4 text-blue-400" />
                    </div>
                    <h4 className="font-medium text-blue-400">Mais Recompensas</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Adicione recompensas intermediárias para manter a motivação durante trilhas longas.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-purple-500/20">
                      <Users className="w-4 h-4 text-purple-400" />
                    </div>
                    <h4 className="font-medium text-purple-400">Mentoria</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Conecte usuários com dificuldade a mentores que já completaram a trilha.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-amber-500/20">
                      <Activity className="w-4 h-4 text-amber-400" />
                    </div>
                    <h4 className="font-medium text-amber-400">Checkpoints</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Adicione checkpoints com quiz rápido para reforçar o aprendizado gradualmente.
                  </p>
                </motion.div>
              </div>
            </ChartCard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
