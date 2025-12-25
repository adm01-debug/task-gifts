import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useBenchmarks, useIndustries, useBenchmarkComparison, useENPSBenchmark, useBenchmarkInsights } from "@/hooks/useBenchmark";
import { PILLAR_LABELS, ClimatePillar } from "@/services/climateSurveyService";
import { TrendingUp, TrendingDown, Award, Target, AlertTriangle, CheckCircle } from "lucide-react";

interface BenchmarkComparisonProps {
  yourScores: Record<ClimatePillar, number>;
  yourENPS: number;
}

const INDUSTRY_LABELS: Record<string, string> = {
  technology: 'Tecnologia',
  finance: 'Finanças',
  retail: 'Varejo',
  healthcare: 'Saúde',
  manufacturing: 'Indústria',
  services: 'Serviços',
  education: 'Educação',
  government: 'Governo',
};

export function BenchmarkComparison({ yourScores, yourENPS }: BenchmarkComparisonProps) {
  const [selectedIndustry, setSelectedIndustry] = useState('services');
  const [companySize, setCompanySize] = useState('all');

  const { data: industries = [] } = useIndustries();
  const { data: comparisons = [] } = useBenchmarkComparison(yourScores, selectedIndustry, companySize);
  const { data: enpsBenchmark } = useENPSBenchmark(selectedIndustry);
  const { data: insights } = useBenchmarkInsights(comparisons);

  const overallYourScore = Object.values(yourScores).reduce((a, b) => a + b, 0) / Object.values(yourScores).length;
  const overallBenchmark = comparisons.length > 0 
    ? comparisons.reduce((a, b) => a + b.industryAverage, 0) / comparisons.length 
    : 0;
  const overallDiff = Math.round(overallYourScore - overallBenchmark);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Setor</label>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Porte da Empresa</label>
          <Select value={companySize} onValueChange={setCompanySize}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os portes</SelectItem>
              <SelectItem value="small">Pequeno (&lt; 50)</SelectItem>
              <SelectItem value="medium">Médio (50-500)</SelectItem>
              <SelectItem value="large">Grande (&gt; 500)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparativo geral */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">eNPS Comparativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sua empresa</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${yourENPS >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {yourENPS > 0 ? '+' : ''}{yourENPS}
                  </span>
                  {enpsBenchmark && yourENPS > enpsBenchmark.average && (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
              {enpsBenchmark && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Média do setor</span>
                      <span>+{enpsBenchmark.average}</span>
                    </div>
                    <Progress value={(enpsBenchmark.average + 100) / 2} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Top 25%</span>
                      <span>+{enpsBenchmark.topQuartile}</span>
                    </div>
                    <Progress value={(enpsBenchmark.topQuartile + 100) / 2} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Top 10%</span>
                      <span>+{enpsBenchmark.top10Percent}</span>
                    </div>
                    <Progress value={(enpsBenchmark.top10Percent + 100) / 2} className="h-2" />
                  </div>
                </>
              )}
              {enpsBenchmark && (
                <div className={`p-3 rounded-lg ${yourENPS > enpsBenchmark.average ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                  <p className={`text-sm font-medium ${yourENPS > enpsBenchmark.average ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {yourENPS > enpsBenchmark.average 
                      ? `🎉 ${Math.round(((yourENPS - enpsBenchmark.average) / enpsBenchmark.average) * 100)}% acima da média!`
                      : `⚠️ ${Math.abs(Math.round(((yourENPS - enpsBenchmark.average) / enpsBenchmark.average) * 100))}% abaixo da média`
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Clima Organizacional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sua empresa</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{Math.round(overallYourScore)}/100</span>
                  {overallDiff > 0 && <TrendingUp className="h-5 w-5 text-green-500" />}
                  {overallDiff < 0 && <TrendingDown className="h-5 w-5 text-red-500" />}
                </div>
              </div>
              {overallBenchmark > 0 && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Média do setor</span>
                      <span>{Math.round(overallBenchmark)}/100</span>
                    </div>
                    <Progress value={overallBenchmark} className="h-2" />
                  </div>
                </>
              )}
              <div className={`p-3 rounded-lg ${overallDiff >= 0 ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                <p className={`text-sm font-medium ${overallDiff >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {overallDiff >= 0 
                    ? `🎉 ${Math.abs(Math.round((overallDiff / overallBenchmark) * 100))}% acima da média!`
                    : `⚠️ ${Math.abs(Math.round((overallDiff / overallBenchmark) * 100))}% abaixo da média`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparativo por pilar */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo por Pilar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisons.map((comparison) => {
              const diff = comparison.yourScore - comparison.industryAverage;
              return (
                <div key={comparison.pillar} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">
                    {PILLAR_LABELS[comparison.pillar]?.pt}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-1 items-center h-6">
                      <div 
                        className="h-full bg-primary rounded-l"
                        style={{ width: `${comparison.yourScore}%` }}
                      />
                      <div 
                        className="h-full bg-muted border-l-2 border-dashed border-primary"
                        style={{ width: `${comparison.industryAverage - comparison.yourScore}%`, display: diff < 0 ? 'block' : 'none' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Você: {comparison.yourScore}</span>
                      <span>Mercado: {comparison.industryAverage}</span>
                    </div>
                  </div>
                  <Badge variant={diff >= 0 ? 'default' : 'destructive'} className="w-16 justify-center">
                    {diff >= 0 ? '+' : ''}{diff}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {insights && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Priorize
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.prioritize.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todos os pilares acima da média!</p>
              ) : (
                <ul className="space-y-2">
                  {insights.prioritize.map(c => (
                    <li key={c.pillar} className="flex items-center justify-between">
                      <span className="text-sm">{PILLAR_LABELS[c.pillar]?.pt}</span>
                      <Badge variant="destructive">{c.yourScore - c.industryAverage}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-yellow-600">
                <Target className="h-4 w-4" />
                Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.attention.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum pilar em observação</p>
              ) : (
                <ul className="space-y-2">
                  {insights.attention.map(c => (
                    <li key={c.pillar} className="flex items-center justify-between">
                      <span className="text-sm">{PILLAR_LABELS[c.pillar]?.pt}</span>
                      <Badge variant="secondary">{c.yourScore - c.industryAverage}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Mantenha
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.maintain.length === 0 ? (
                <p className="text-sm text-muted-foreground">Continue melhorando!</p>
              ) : (
                <ul className="space-y-2">
                  {insights.maintain.map(c => (
                    <li key={c.pillar} className="flex items-center justify-between">
                      <span className="text-sm">{PILLAR_LABELS[c.pillar]?.pt}</span>
                      <Badge className="bg-green-500">+{c.yourScore - c.industryAverage}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
