import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  Clock, 
  BookOpen, 
  Zap,
  ArrowLeft,
  RefreshCw,
  Download,
  Calendar,
  Building2,
  GraduationCap,
  Trophy,
  Flame,
  PieChart,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PageWrapper } from "@/components/PageWrapper";
import { SEOHead } from "@/components/SEOHead";
import { useSEO } from "@/hooks/useSEO";
import { useExecutiveMetrics, useMonthlyTrends, useDepartmentMetrics } from "@/hooks/useExecutiveMetrics";
import { useCompletionTrend, useDepartmentPerformance, useWeeklyEngagement, useEngagementMetrics } from "@/hooks/useEngagementReports";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { TrendData, DepartmentData, WeeklyEngagementData } from "@/types/charts";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(142, 76%, 36%)",
  "hsl(48, 96%, 53%)",
  "hsl(280, 65%, 60%)"
];

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  target?: number;
  current?: number;
  color?: string;
}

const KPICard = ({ title, value, subtitle, icon, trend, target, current, color = "primary" }: KPICardProps) => {
  const progress = target && current ? (current / target) * 100 : undefined;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="card-interactive h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl bg-${color}/10`}>
              {icon}
            </div>
            {trend !== undefined && (
              <Badge 
                variant={trend >= 0 ? "default" : "destructive"}
                className="text-xs"
              >
                {trend >= 0 ? "+" : ""}{trend}%
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70">{subtitle}</p>
            )}
          </div>
          {progress !== undefined && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Meta: {target}</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload, label }: { 
  active?: boolean; 
  payload?: Array<{ name: string; value: number | string; color?: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function BIDashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useExecutiveMetrics();
  const { data: trends, isLoading: loadingTrends, refetch: refetchTrends } = useMonthlyTrends();
  const { data: departments, isLoading: loadingDepts, refetch: refetchDepts } = useDepartmentMetrics();
  const { data: completionTrend, isLoading: loadingCompletion } = useCompletionTrend(6);
  const { data: weeklyEngagement, isLoading: loadingWeekly } = useWeeklyEngagement();
  const { data: engagementMetrics, isLoading: loadingEngagement } = useEngagementMetrics();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchMetrics(), refetchTrends(), refetchDepts()]);
    setIsRefreshing(false);
  };

  const isLoading = loadingMetrics || loadingTrends || loadingDepts;

  // Prepare chart data
  const trendsData = trends?.map((t: TrendData) => ({
    month: t.month,
    usuarios: t.totalUsers,
    xpTotal: Math.round((t.totalXp || 0) / 1000),
    pontualidade: t.punctualityRate,
    treinamento: t.trainingRate,
    adocao: t.adoption
  })) || [];

  const deptData = departments?.map((d: DepartmentData) => ({
    name: d.name?.substring(0, 12) || 'N/A',
    funcionarios: d.employeeCount || 0,
    xpTotal: Math.round((d.totalXp || 0) / 1000),
    nivelMedio: d.avgLevel || 0,
    pontualidade: d.punctualityRate || 0,
    quests: d.questsCompleted || 0,
    score: d.score || 0
  })) || [];

  const engagementData = weeklyEngagement?.map((w: WeeklyEngagementData) => ({
    dia: w.day?.substring(0, 3) || 'N/A',
    atividade: w.quests || 0
  })) || [];

  // OKR Progress data
  const okrData = [
    { name: 'Adoção', atual: metrics?.dau || 0, meta: 70, fill: CHART_COLORS[0] },
    { name: 'Pontualidade', atual: metrics?.punctualityRate || 0, meta: 95, fill: CHART_COLORS[1] },
    { name: 'Treinamento', atual: metrics?.trainingCompletionRate || 0, meta: 95, fill: CHART_COLORS[2] },
    { name: 'Nível 5+', atual: metrics?.level5PlusRate || 0, meta: 50, fill: CHART_COLORS[3] },
  ];

  // Radar data for competencies by department
  const radarData = deptData.slice(0, 5).map(d => ({
    departamento: d.name,
    produtividade: Math.min(100, (d.xpTotal / 10) + 40),
    engajamento: Math.min(100, d.pontualidade),
    treinamento: Math.min(100, (d.quests * 5) + 30),
    colaboracao: Math.min(100, (d.score / 10) + 20),
    inovacao: Math.min(100, (d.nivelMedio * 10) + 10)
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const seo = useSEO();

  return (
    <PageWrapper pageName="Business Intelligence">
      <SEOHead {...seo} />
      <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Business Intelligence
                </h1>
                <p className="text-sm text-muted-foreground">
                  Visão executiva de métricas e KPIs
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="12m">Últimos 12 meses</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards - Row 1 */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Indicadores Principais
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SectionErrorBoundary sectionName="KPI Total Usuários">
              <KPICard
                title="Total de Usuários"
                value={metrics?.totalUsers || 0}
                subtitle="Colaboradores cadastrados"
                icon={<Users className="h-5 w-5 text-primary" />}
                trend={12}
              />
            </SectionErrorBoundary>
            
            <SectionErrorBoundary sectionName="KPI DAU">
              <KPICard
                title="Taxa DAU"
                value={`${metrics?.dau || 0}%`}
                subtitle="Usuários ativos hoje"
                icon={<Activity className="h-5 w-5 text-chart-2" />}
                target={70}
                current={metrics?.dau || 0}
              />
            </SectionErrorBoundary>
            
            <SectionErrorBoundary sectionName="KPI Pontualidade">
              <KPICard
                title="Pontualidade"
                value={`${metrics?.punctualityRate || 0}%`}
                subtitle="Check-ins no horário"
                icon={<Clock className="h-5 w-5 text-chart-3" />}
                target={95}
                current={metrics?.punctualityRate || 0}
              />
            </SectionErrorBoundary>
            
            <SectionErrorBoundary sectionName="KPI Treinamento">
              <KPICard
                title="Treinamentos"
                value={`${metrics?.trainingCompletionRate || 0}%`}
                subtitle="Trilhas concluídas"
                icon={<GraduationCap className="h-5 w-5 text-chart-4" />}
                target={95}
                current={metrics?.trainingCompletionRate || 0}
              />
            </SectionErrorBoundary>
          </div>
        </section>

        {/* KPI Cards - Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SectionErrorBoundary sectionName="KPI XP Total">
            <KPICard
              title="XP Total Distribuído"
              value={(metrics?.totalXpEarned || 0).toLocaleString('pt-BR')}
              subtitle="Pontos de experiência"
              icon={<Zap className="h-5 w-5 text-yellow-500" />}
              trend={18}
            />
          </SectionErrorBoundary>
          
          <SectionErrorBoundary sectionName="KPI Quests">
            <KPICard
              title="Quests Concluídas"
              value={metrics?.totalQuestsCompleted || 0}
              subtitle="Missões completadas"
              icon={<Trophy className="h-5 w-5 text-amber-500" />}
              trend={25}
            />
          </SectionErrorBoundary>
          
          <SectionErrorBoundary sectionName="KPI Kudos">
            <KPICard
              title="Kudos Enviados"
              value={metrics?.totalKudos || 0}
              subtitle="Reconhecimentos"
              icon={<Award className="h-5 w-5 text-pink-500" />}
              trend={8}
            />
          </SectionErrorBoundary>
          
          <SectionErrorBoundary sectionName="KPI Nivel 5+">
            <KPICard
              title="Nível 5+"
              value={`${metrics?.level5Plus || 0}`}
              subtitle={`${metrics?.level5PlusRate || 0}% do total`}
              icon={<Flame className="h-5 w-5 text-orange-500" />}
              target={50}
              current={metrics?.level5PlusRate || 0}
            />
          </SectionErrorBoundary>
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="departments">Departamentos</TabsTrigger>
            <TabsTrigger value="training">Treinamento</TabsTrigger>
            <TabsTrigger value="okrs">OKRs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Evolution Chart */}
              <SectionErrorBoundary sectionName="Gráfico Evolução">
                <Card className="card-base">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Evolução Mensal
                    </CardTitle>
                    <CardDescription>Tendência dos últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={trendsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="usuarios" name="Usuários" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="pontualidade" name="Pontualidade %" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ fill: CHART_COLORS[1] }} />
                        <Line yAxisId="right" type="monotone" dataKey="adocao" name="Adoção %" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ fill: CHART_COLORS[2] }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </SectionErrorBoundary>

              {/* Weekly Engagement */}
              <SectionErrorBoundary sectionName="Engajamento Semanal">
                <Card className="card-base">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-chart-2" />
                      Engajamento por Dia
                    </CardTitle>
                    <CardDescription>Atividade ao longo da semana</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={engagementData}>
                        <defs>
                          <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="atividade" 
                          name="Atividades"
                          stroke={CHART_COLORS[0]} 
                          fillOpacity={1} 
                          fill="url(#colorActivity)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </SectionErrorBoundary>
            </div>

            {/* XP Distribution */}
            <SectionErrorBoundary sectionName="Distribuição XP">
              <Card className="card-base">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    XP por Departamento
                  </CardTitle>
                  <CardDescription>Distribuição de pontos de experiência</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deptData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="xpTotal" name="XP (milhares)" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]}>
                        {deptData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </SectionErrorBoundary>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Department Comparison */}
              <SectionErrorBoundary sectionName="Comparativo Departamentos">
                <Card className="card-base">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Comparativo de Departamentos
                    </CardTitle>
                    <CardDescription>Métricas por área</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={deptData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="funcionarios" name="Funcionários" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="quests" name="Quests" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="nivelMedio" name="Nível Médio" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </SectionErrorBoundary>

              {/* Department Score Pie */}
              <SectionErrorBoundary sectionName="Score Departamentos">
                <Card className="card-base">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-chart-2" />
                      Score por Departamento
                    </CardTitle>
                    <CardDescription>Pontuação geral por área</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RechartsPieChart>
                        <Pie
                          data={deptData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="score"
                        >
                          {deptData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </SectionErrorBoundary>
            </div>

            {/* Department Radar */}
            <SectionErrorBoundary sectionName="Radar Competências">
              <Card className="card-base">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-chart-3" />
                    Radar de Competências
                  </CardTitle>
                  <CardDescription>Análise multidimensional por departamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="departamento" stroke="hsl(var(--muted-foreground))" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                      <Radar name="Produtividade" dataKey="produtividade" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.3} />
                      <Radar name="Engajamento" dataKey="engajamento" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.3} />
                      <Radar name="Treinamento" dataKey="treinamento" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.3} />
                      <Legend />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </SectionErrorBoundary>

            {/* Department Table */}
            <SectionErrorBoundary sectionName="Tabela Departamentos">
              <Card className="card-base">
                <CardHeader>
                  <CardTitle>Ranking de Departamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-medium text-muted-foreground">Posição</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Departamento</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Funcionários</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">XP Total</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Nível Médio</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Pontualidade</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deptData.sort((a, b) => b.score - a.score).map((dept, index) => (
                          <motion.tr 
                            key={dept.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <td className="p-3">
                              <Badge variant={index < 3 ? "default" : "secondary"}>
                                #{index + 1}
                              </Badge>
                            </td>
                            <td className="p-3 font-medium">{dept.name}</td>
                            <td className="p-3 text-right">{dept.funcionarios}</td>
                            <td className="p-3 text-right">{(dept.xpTotal * 1000).toLocaleString('pt-BR')}</td>
                            <td className="p-3 text-right">{dept.nivelMedio.toFixed(1)}</td>
                            <td className="p-3 text-right">
                              <span className={dept.pontualidade >= 90 ? 'text-green-500' : dept.pontualidade >= 70 ? 'text-yellow-500' : 'text-red-500'}>
                                {dept.pontualidade}%
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold">{dept.score}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </SectionErrorBoundary>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Completion Trend */}
              <SectionErrorBoundary sectionName="Tendência Conclusão">
                <Card className="card-base">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Taxa de Conclusão
                    </CardTitle>
                    <CardDescription>Evolução mensal de treinamentos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={completionTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="completed" name="Concluídas" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ fill: CHART_COLORS[0] }} />
                        <Line type="monotone" dataKey="started" name="Iniciadas" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ fill: CHART_COLORS[1] }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </SectionErrorBoundary>

              {/* Training Stats */}
              <SectionErrorBoundary sectionName="Stats Treinamento">
                <Card className="card-base">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-chart-2" />
                      Métricas de Treinamento
                    </CardTitle>
                    <CardDescription>Indicadores de aprendizagem</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Trilhas Concluídas</span>
                        <span className="font-bold">{metrics?.completedTrails || 0}</span>
                      </div>
                      <Progress value={(metrics?.trainingCompletionRate || 0)} className="h-2" />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Matrículas Totais</span>
                        <span className="font-bold">{metrics?.totalEnrollments || 0}</span>
                      </div>
                      <Progress value={Math.min(100, ((metrics?.totalEnrollments || 0) / (metrics?.totalUsers || 1)) * 100)} className="h-2" />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Horas Médias de Treino</span>
                        <span className="font-bold">{(metrics?.avgTrainingHours || 0).toFixed(1)}h</span>
                      </div>
                      <Progress value={Math.min(100, ((metrics?.avgTrainingHours || 0) / 20) * 100)} className="h-2" />
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-primary">{metrics?.totalQuestsCompleted || 0}</p>
                          <p className="text-xs text-muted-foreground">Quests Feitas</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-chart-2">
                            {metrics?.totalUsers ? ((metrics?.totalQuestsCompleted || 0) / metrics.totalUsers).toFixed(1) : 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Média/Usuário</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SectionErrorBoundary>
            </div>
          </TabsContent>

          {/* OKRs Tab */}
          <TabsContent value="okrs" className="space-y-6">
            <SectionErrorBoundary sectionName="Progresso OKRs">
              <Card className="card-base">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Progresso dos OKRs
                  </CardTitle>
                  <CardDescription>Objetivos e resultados-chave do trimestre</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {okrData.map((okr, index) => (
                      <motion.div 
                        key={okr.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: okr.fill }}
                            />
                            <span className="font-medium">{okr.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                              Meta: {okr.meta}%
                            </span>
                            <Badge variant={okr.atual >= okr.meta ? "default" : okr.atual >= okr.meta * 0.7 ? "secondary" : "destructive"}>
                              {okr.atual}%
                            </Badge>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={(okr.atual / okr.meta) * 100} className="h-3" />
                          <div 
                            className="absolute top-0 h-3 w-0.5 bg-foreground/50"
                            style={{ left: '100%' }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </SectionErrorBoundary>

            {/* OKR Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="card-subtle text-center p-4">
                <div className="text-3xl font-bold text-green-500">
                  {okrData.filter(o => o.atual >= o.meta).length}
                </div>
                <p className="text-sm text-muted-foreground">Metas Atingidas</p>
              </Card>
              <Card className="card-subtle text-center p-4">
                <div className="text-3xl font-bold text-yellow-500">
                  {okrData.filter(o => o.atual >= o.meta * 0.7 && o.atual < o.meta).length}
                </div>
                <p className="text-sm text-muted-foreground">Em Progresso</p>
              </Card>
              <Card className="card-subtle text-center p-4">
                <div className="text-3xl font-bold text-red-500">
                  {okrData.filter(o => o.atual < o.meta * 0.7).length}
                </div>
                <p className="text-sm text-muted-foreground">Atenção</p>
              </Card>
              <Card className="card-subtle text-center p-4">
                <div className="text-3xl font-bold text-primary">
                  {Math.round(okrData.reduce((acc, o) => acc + (o.atual / o.meta) * 100, 0) / okrData.length)}%
                </div>
                <p className="text-sm text-muted-foreground">Progresso Geral</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </PageWrapper>
  );
}
