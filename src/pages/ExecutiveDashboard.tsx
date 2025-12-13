import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Award,
  Clock,
  BookOpen,
  Flame,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Smile,
  Frown,
  Meh
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for executive metrics
const financialMetrics = {
  roiGamification: { value: 245, target: 200, trend: 12 },
  costPerHire: { value: 1150, target: 1200, trend: -8 },
  turnoverCostSaved: { value: 62500, target: 50000, trend: 25 },
  revenuePerEmployee: { value: 18500, target: 17000, trend: 9 },
  hrOperationalCost: { value: 125, target: 160, trend: -22 }
};

const peopleMetrics = {
  enps: { value: 58, target: 50, promoters: 65, passives: 25, detractors: 10 },
  turnover: { value: 8.5, target: 10, previousYear: 18 },
  gameAdoption: { value: 87, target: 80 },
  level5Plus: { value: 24, target: 20 },
  dau: { value: 73, target: 70 },
  wau: { value: 91, target: 90 }
};

const operationalMetrics = {
  punctualCheckin: { value: 94, target: 95 },
  absenteeism: { value: 2.1, target: 3 },
  trainingCompletion: { value: 92, target: 95 },
  avgTrainingHours: { value: 18.5, target: 20 },
  certifications: { value: 35, target: 30 }
};

// Trend data for charts
const monthlyTrendData = [
  { month: 'Jul', roi: 180, enps: 42, adoption: 65, turnover: 14 },
  { month: 'Ago', roi: 195, enps: 45, adoption: 72, turnover: 12 },
  { month: 'Set', roi: 210, enps: 48, adoption: 78, turnover: 11 },
  { month: 'Out', roi: 225, enps: 52, adoption: 82, turnover: 9.5 },
  { month: 'Nov', roi: 235, enps: 55, adoption: 85, turnover: 9 },
  { month: 'Dez', roi: 245, enps: 58, adoption: 87, turnover: 8.5 }
];

const departmentPerformance = [
  { name: 'Comercial', score: 92, employees: 12 },
  { name: 'Artes', score: 88, employees: 8 },
  { name: 'Gravação', score: 95, employees: 15 },
  { name: 'Expedição', score: 85, employees: 10 },
  { name: 'Compras', score: 90, employees: 6 },
  { name: 'Financeiro', score: 87, employees: 5 }
];

const enpsDistribution = [
  { name: 'Promotores', value: 65, color: 'hsl(var(--success))' },
  { name: 'Passivos', value: 25, color: 'hsl(var(--warning))' },
  { name: 'Detratores', value: 10, color: 'hsl(var(--destructive))' }
];

const ExecutiveDashboard = () => {
  const navigate = useNavigate();

  const MetricCard = ({ 
    title, 
    value, 
    target, 
    unit = '', 
    prefix = '',
    trend,
    icon: Icon,
    description,
    inverse = false
  }: {
    title: string;
    value: number;
    target: number;
    unit?: string;
    prefix?: string;
    trend?: number;
    icon: React.ElementType;
    description?: string;
    inverse?: boolean;
  }) => {
    const isOnTarget = inverse ? value <= target : value >= target;
    const progress = inverse 
      ? Math.min(100, (target / value) * 100)
      : Math.min(100, (value / target) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${isOnTarget ? 'bg-success/10' : 'bg-warning/10'}`}>
                <Icon className={`w-5 h-5 ${isOnTarget ? 'text-success' : 'text-warning'}`} />
              </div>
              {trend !== undefined && (
                <Badge 
                  variant="outline" 
                  className={trend >= 0 
                    ? (inverse ? 'border-destructive/50 text-destructive' : 'border-success/50 text-success')
                    : (inverse ? 'border-success/50 text-success' : 'border-destructive/50 text-destructive')
                  }
                >
                  {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(trend)}%
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">
                {prefix}{typeof value === 'number' && value >= 1000 
                  ? value.toLocaleString('pt-BR') 
                  : value}{unit}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Meta: {prefix}{target}{unit}</span>
                <span className={isOnTarget ? 'text-success' : 'text-warning'}>
                  {isOnTarget ? '✓ Atingida' : 'Em progresso'}
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Dashboard Executivo</h1>
                <p className="text-sm text-muted-foreground">
                  Visão C-Level • {format(new Date(), "MMMM yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Atualizado: {format(new Date(), "dd/MM HH:mm")}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Tabs for different perspectives */}
        <Tabs defaultValue="financial" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="financial" className="gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Pessoas</span>
            </TabsTrigger>
            <TabsTrigger value="operational" className="gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Operacional</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Aprendizado</span>
            </TabsTrigger>
          </TabsList>

          {/* Financial Perspective */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="ROI Gamificação"
                value={financialMetrics.roiGamification.value}
                target={financialMetrics.roiGamification.target}
                unit="%"
                trend={financialMetrics.roiGamification.trend}
                icon={TrendingUp}
                description="Retorno sobre investimento"
              />
              <MetricCard
                title="Custo por Contratação"
                value={financialMetrics.costPerHire.value}
                target={financialMetrics.costPerHire.target}
                prefix="R$ "
                trend={financialMetrics.costPerHire.trend}
                icon={DollarSign}
                inverse
              />
              <MetricCard
                title="Custo Turnover Evitado"
                value={financialMetrics.turnoverCostSaved.value}
                target={financialMetrics.turnoverCostSaved.target}
                prefix="R$ "
                trend={financialMetrics.turnoverCostSaved.trend}
                icon={Award}
                description="Economia anual estimada"
              />
            </div>

            {/* ROI Trend Chart */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Evolução do ROI de Gamificação
                </CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendData}>
                      <defs>
                        <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value}%`, 'ROI']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="roi" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fill="url(#roiGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* People Perspective */}
          <TabsContent value="people" className="space-y-6">
            {/* eNPS Highlight Card */}
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Smile className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Employee Net Promoter Score</p>
                        <p className="text-5xl font-bold text-primary">+{peopleMetrics.enps.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge className="bg-success/20 text-success border-success/40">
                        Meta: {peopleMetrics.enps.target} ✓
                      </Badge>
                      <span className="text-muted-foreground">
                        Zona de Qualidade
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      O eNPS mede a lealdade e satisfação dos colaboradores. 
                      Valores acima de 50 são considerados excelentes.
                    </p>
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={enpsDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {enpsDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend 
                          verticalAlign="middle" 
                          align="right"
                          layout="vertical"
                          formatter={(value, entry: any) => (
                            <span className="text-sm text-foreground">
                              {value}: {entry.payload.value}%
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Taxa de Turnover"
                value={peopleMetrics.turnover.value}
                target={peopleMetrics.turnover.target}
                unit="%"
                icon={Users}
                description={`Ano anterior: ${peopleMetrics.turnover.previousYear}%`}
                inverse
              />
              <MetricCard
                title="Adesão ao Game"
                value={peopleMetrics.gameAdoption.value}
                target={peopleMetrics.gameAdoption.target}
                unit="%"
                icon={Target}
              />
              <MetricCard
                title="DAU (Usuários Ativos)"
                value={peopleMetrics.dau.value}
                target={peopleMetrics.dau.target}
                unit="%"
                icon={Activity}
              />
              <MetricCard
                title="Nível 5+ (Especialistas)"
                value={peopleMetrics.level5Plus.value}
                target={peopleMetrics.level5Plus.target}
                unit="%"
                icon={Award}
              />
            </div>

            {/* Turnover & Adoption Trend */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-success" />
                  Evolução Turnover vs Adesão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="turnover" 
                        name="Turnover %"
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="adoption" 
                        name="Adesão %"
                        stroke="hsl(var(--success))" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operational Perspective */}
          <TabsContent value="operational" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="Check-in Pontual"
                value={operationalMetrics.punctualCheckin.value}
                target={operationalMetrics.punctualCheckin.target}
                unit="%"
                icon={Clock}
              />
              <MetricCard
                title="Taxa de Absenteísmo"
                value={operationalMetrics.absenteeism.value}
                target={operationalMetrics.absenteeism.target}
                unit="%"
                icon={Users}
                inverse
              />
              <MetricCard
                title="Conclusão Treinamentos"
                value={operationalMetrics.trainingCompletion.value}
                target={operationalMetrics.trainingCompletion.target}
                unit="%"
                icon={BookOpen}
              />
            </div>

            {/* Department Performance */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Performance por Departamento
                </CardTitle>
                <CardDescription>Score de engajamento e produtividade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number, name: string, props: any) => [
                          `${value}% (${props.payload.employees} colaboradores)`,
                          'Score'
                        ]}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {departmentPerformance.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.score >= 90 ? 'hsl(var(--success))' : entry.score >= 85 ? 'hsl(var(--primary))' : 'hsl(var(--warning))'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Perspective */}
          <TabsContent value="learning" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="Horas Treinamento/Colaborador"
                value={operationalMetrics.avgTrainingHours.value}
                target={operationalMetrics.avgTrainingHours.target}
                unit="h"
                icon={Clock}
                description="Média anual por pessoa"
              />
              <MetricCard
                title="Colaboradores Certificados"
                value={operationalMetrics.certifications.value}
                target={operationalMetrics.certifications.target}
                unit="%"
                icon={Award}
              />
              <MetricCard
                title="Conclusão Obrigatórios"
                value={operationalMetrics.trainingCompletion.value}
                target={operationalMetrics.trainingCompletion.target}
                unit="%"
                icon={BookOpen}
              />
            </div>

            {/* eNPS Trend */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-primary" />
                  Evolução do eNPS
                </CardTitle>
                <CardDescription>Satisfação dos colaboradores ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendData}>
                      <defs>
                        <linearGradient id="enpsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`+${value}`, 'eNPS']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="enps" 
                        stroke="hsl(var(--success))" 
                        strokeWidth={3}
                        fill="url(#enpsGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* OKR Summary */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Resumo OKRs Q4 2025
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Objetivos Atingidos</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'ROI Gamificação > 200%', done: true },
                        { label: 'eNPS > 50', done: true },
                        { label: 'Turnover < 10%', done: true },
                        { label: 'Adesão Game > 80%', done: true }
                      ].map((okr, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${okr.done ? 'bg-success/20 text-success' : 'bg-muted'}`}>
                            {okr.done && '✓'}
                          </div>
                          <span className={okr.done ? 'text-foreground' : 'text-muted-foreground'}>{okr.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Em Progresso</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Check-in pontual > 95%', progress: 94 },
                        { label: 'Conclusão treinamentos > 95%', progress: 92 },
                        { label: 'Horas capacitação > 20h', progress: 93 }
                      ].map((okr, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{okr.label}</span>
                            <span className="text-warning font-medium">{okr.progress}%</span>
                          </div>
                          <Progress value={okr.progress} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ExecutiveDashboard;
