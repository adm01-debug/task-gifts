import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useEngagementSummary, useTalentSummary, useAnalyticsMetrics, useReportTemplates } from "@/hooks/useReports";
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Target, 
  Award, FileText, Download, ArrowUpRight, ArrowDownRight 
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const MetricCard = ({ 
  label, 
  value, 
  change, 
  trend, 
  icon: Icon 
}: { 
  label: string; 
  value: string | number; 
  change?: number; 
  trend?: 'up' | 'down' | 'stable';
  icon: React.ElementType;
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${
              trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : 
               trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
              {change > 0 ? '+' : ''}{change}%
            </div>
          )}
        </div>
        <Icon className="h-8 w-8 text-muted-foreground opacity-50" />
      </div>
    </CardContent>
  </Card>
);

const PillarChart = ({ pillarScores }: { pillarScores: { pillar: string; score: number; trend: number }[] }) => (
  <div className="space-y-3">
    {pillarScores.map((pillar) => (
      <div key={pillar.pillar} className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span>{pillar.pillar}</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{pillar.score}/100</span>
            <span className={`text-xs ${pillar.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {pillar.trend >= 0 ? '+' : ''}{pillar.trend}
            </span>
          </div>
        </div>
        <Progress value={pillar.score} className="h-2" />
      </div>
    ))}
  </div>
);

export const AnalyticsDashboard = () => {
  const [period, setPeriod] = useState('month');
  const [department, setDepartment] = useState<string | undefined>();

  const { data: engagementSummary, isLoading: engagementLoading } = useEngagementSummary(department);
  const { data: talentSummary, isLoading: talentLoading } = useTalentSummary(department);
  const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics(period);
  const { data: templates } = useReportTemplates();

  if (engagementLoading || talentLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Analytics & Relatórios
        </h2>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="talent">Talentos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {metrics?.map((metric) => (
              <MetricCard
                key={metric.key}
                label={metric.label}
                value={metric.value}
                change={metric.change_percent}
                trend={metric.trend}
                icon={
                  metric.key === 'active_users' ? Users :
                  metric.key === 'goals_completed' ? Target :
                  metric.key === 'recognitions' ? Award :
                  BarChart3
                }
              />
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-3xl font-bold text-primary">+{engagementSummary?.enps}</p>
                    <p className="text-sm text-muted-foreground">eNPS</p>
                    <Badge variant="outline" className={engagementSummary?.trends.enps! >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                      {engagementSummary?.trends.enps! >= 0 ? '+' : ''}{engagementSummary?.trends.enps} pts
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-3xl font-bold">{engagementSummary?.climateScore}</p>
                    <p className="text-sm text-muted-foreground">Clima Geral</p>
                    <Badge variant="outline" className={engagementSummary?.trends.climate! >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                      {engagementSummary?.trends.climate! >= 0 ? '+' : ''}{engagementSummary?.trends.climate}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Participação</span>
                  <span className="font-medium">{engagementSummary?.participationRate}%</span>
                </div>
                <Progress value={engagementSummary?.participationRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Talentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-3xl font-bold">{talentSummary?.avgScore}</p>
                    <p className="text-sm text-muted-foreground">Nota Média</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-3xl font-bold">{talentSummary?.completedTrainings}</p>
                    <p className="text-sm text-muted-foreground">Treinamentos</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Top Performers</p>
                  {talentSummary?.topPerformers.map((performer, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{performer.name}</span>
                      <Badge variant="outline">{performer.score}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <MetricCard label="eNPS" value={`+${engagementSummary?.enps}`} change={engagementSummary?.trends.enps} trend="up" icon={TrendingUp} />
            <MetricCard label="lNPS" value={`+${engagementSummary?.lnps}`} change={engagementSummary?.trends.lnps} trend="down" icon={TrendingDown} />
            <MetricCard label="Clima Geral" value={`${engagementSummary?.climateScore}/100`} change={engagementSummary?.trends.climate} trend="up" icon={BarChart3} />
            <MetricCard label="Participação" value={`${engagementSummary?.participationRate}%`} change={engagementSummary?.trends.participation} trend="up" icon={Users} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>10 Pilares do Clima</CardTitle>
            </CardHeader>
            <CardContent>
              <PillarChart pillarScores={engagementSummary?.pillarScores || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="talent" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <MetricCard label="Avaliações" value={talentSummary?.totalEvaluations || 0} icon={FileText} />
            <MetricCard label="Nota Média" value={talentSummary?.avgScore || 0} icon={Award} />
            <MetricCard label="PDIs Pendentes" value={talentSummary?.pendingPDIs || 0} icon={Target} />
            <MetricCard label="Treinamentos" value={talentSummary?.completedTrainings || 0} icon={BarChart3} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {talentSummary?.topPerformers.map((performer, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </div>
                        <span className="font-medium">{performer.name}</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500">{performer.score}/10</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gaps de Competência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {talentSummary?.skillGaps.map((gap, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{gap.skill}</span>
                        <span className="text-red-500">{gap.gap}% gap</span>
                      </div>
                      <Progress value={100 - gap.gap} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {templates?.map((template) => (
                  <Card key={template.id} className="bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        Gerar Relatório
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
