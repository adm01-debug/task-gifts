import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCompetencyMatrix } from "@/hooks/useCompetencyMatrix";
import { useAuth } from "@/hooks/useAuth";
import type { CompetencyGap } from "@/services/competencyMatrixService";
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

interface CompetencyMatrixPanelProps {
  positionId?: string;
}

export const CompetencyMatrixPanel = ({ positionId }: CompetencyMatrixPanelProps) => {
  const { user } = useAuth();
  const { positionCompetencies, userAssessments, calculateGaps } = useCompetencyMatrix(positionId);
  const [gaps, setGaps] = useState<CompetencyGap[]>([]);

  useEffect(() => {
    if (user?.id && positionId) {
      calculateGaps(user.id, positionId).then(setGaps);
    }
  }, [user?.id, positionId, calculateGaps]);

  const criticalGaps = gaps.filter(g => g.gap >= 2 && g.is_mandatory);
  const moderateGaps = gaps.filter(g => g.gap === 1);
  const strengths = gaps.filter(g => g.gap <= 0);

  const getGapColor = (gap: number) => {
    if (gap >= 2) return 'text-red-500';
    if (gap === 1) return 'text-amber-500';
    if (gap === 0) return 'text-blue-500';
    return 'text-green-500';
  };

  const getGapIcon = (gap: number) => {
    if (gap >= 2) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (gap === 1) return <TrendingUp className="h-4 w-4 text-amber-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
              <div>
                <p className="text-2xl font-bold">{criticalGaps.length}</p>
                <p className="text-sm text-muted-foreground">Gaps Críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg"><TrendingUp className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="text-2xl font-bold">{moderateGaps.length}</p>
                <p className="text-sm text-muted-foreground">Em Desenvolvimento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-2xl font-bold">{strengths.length}</p>
                <p className="text-sm text-muted-foreground">Pontos Fortes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competency Gaps List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Matriz de Competências
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gaps.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {positionId ? 'Nenhuma competência mapeada para este cargo' : 'Selecione um cargo para ver a matriz'}
            </p>
          ) : (
            <div className="space-y-4">
              {gaps.map(gap => (
                <div key={gap.competency_id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getGapIcon(gap.gap)}
                      <span className="font-medium">{gap.competency_name}</span>
                      {gap.is_mandatory && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
                    </div>
                    <span className={`font-bold ${getGapColor(gap.gap)}`}>
                      {gap.gap > 0 ? `-${gap.gap}` : gap.gap === 0 ? '=' : `+${Math.abs(gap.gap)}`}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nível Atual</span>
                      <span>{gap.current_level}/5</span>
                    </div>
                    <Progress value={(gap.current_level / 5) * 100} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nível Esperado</span>
                      <span>{gap.required_level}/5</span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div className="absolute h-full bg-primary/30" style={{ width: `${(gap.required_level / 5) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Assessments History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          {userAssessments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhuma avaliação registrada</p>
          ) : (
            <div className="space-y-2">
              {userAssessments.slice(0, 10).map(assessment => (
                <div key={assessment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Competência: {assessment.competency_id.slice(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground capitalize">{assessment.assessment_type} • {new Date(assessment.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <Badge variant="outline">Nível {assessment.assessed_level}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
