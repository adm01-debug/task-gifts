import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PILLAR_LABELS, ClimatePillar, ClimatePillarScore } from "@/services/climateSurveyService";
import { TrendingUp, TrendingDown, Minus, Target, AlertTriangle, CheckCircle } from "lucide-react";

interface ClimatePillarsDashboardProps {
  scores: ClimatePillarScore[];
  loading?: boolean;
}

const PILLAR_ORDER: ClimatePillar[] = [
  'recognition', 'autonomy', 'growth', 'leadership', 'peers',
  'purpose', 'environment', 'communication', 'benefits', 'balance'
];

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};

const getProgressColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const TrendIcon = ({ trend, previousScore, currentScore }: { trend: string | null; previousScore: number | null; currentScore: number }) => {
  if (!previousScore) return <Minus className="h-4 w-4 text-muted-foreground" />;
  
  const diff = currentScore - previousScore;
  if (diff > 2) return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (diff < -2) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export function ClimatePillarsDashboard({ scores, loading }: ClimatePillarsDashboardProps) {
  const scoresByPillar = new Map(scores.map(s => [s.pillar, s]));
  const overallScore = scores.length > 0 
    ? Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length)
    : 0;

  const prioritize = scores.filter(s => s.score < 60).sort((a, b) => a.score - b.score);
  const maintain = scores.filter(s => s.score >= 75).sort((a, b) => b.score - a.score);
  const attention = scores.filter(s => s.score >= 60 && s.score < 75);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Geral */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Clima Organizacional Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <div className="text-muted-foreground text-lg">/100</div>
            <div className="flex-1">
              <Progress value={overallScore} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 10 Pilares */}
      <Card>
        <CardHeader>
          <CardTitle>10 Pilares do Clima</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TooltipProvider>
            {PILLAR_ORDER.map((pillar) => {
              const score = scoresByPillar.get(pillar);
              const value = score?.score || 0;

              return (
                <Tooltip key={pillar}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                      <div className="w-32 text-sm font-medium">
                        {PILLAR_LABELS[pillar].pt}
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <Progress value={value} className="h-6" />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                            {value}/100
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-16">
                        <TrendIcon 
                          trend={score?.trend || null} 
                          previousScore={score?.previous_score || null} 
                          currentScore={value} 
                        />
                        {score?.previous_score && (
                          <span className="text-xs text-muted-foreground">
                            {value > score.previous_score ? '+' : ''}{value - score.previous_score}
                          </span>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{score?.response_count || 0} respostas</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Pilares Inteligentes */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Priorize
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prioritize.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum pilar crítico</p>
            ) : (
              <ul className="space-y-2">
                {prioritize.slice(0, 3).map(s => (
                  <li key={s.pillar} className="flex items-center justify-between">
                    <span className="text-sm">{PILLAR_LABELS[s.pillar].pt}</span>
                    <Badge variant="destructive">{s.score}</Badge>
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
            {attention.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum pilar em observação</p>
            ) : (
              <ul className="space-y-2">
                {attention.slice(0, 3).map(s => (
                  <li key={s.pillar} className="flex items-center justify-between">
                    <span className="text-sm">{PILLAR_LABELS[s.pillar].pt}</span>
                    <Badge variant="secondary">{s.score}</Badge>
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
            {maintain.length === 0 ? (
              <p className="text-sm text-muted-foreground">Continue melhorando!</p>
            ) : (
              <ul className="space-y-2">
                {maintain.slice(0, 3).map(s => (
                  <li key={s.pillar} className="flex items-center justify-between">
                    <span className="text-sm">{PILLAR_LABELS[s.pillar].pt}</span>
                    <Badge className="bg-green-500">{s.score}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
