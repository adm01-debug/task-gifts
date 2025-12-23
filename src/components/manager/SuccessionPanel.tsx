import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  ChevronRight,
  Crown,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  Award,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { useCriticalPositions, useSuccessionManual, useSuccessionHealth } from "@/hooks/useSuccession";
import { CriticalPosition, SuccessionPlan, SuccessorCandidate } from "@/services/successionService";

export function SuccessionPanel() {
  const { data: criticalPositions, isLoading: loadingPositions } = useCriticalPositions();
  const { data: healthData, isLoading: loadingHealth } = useSuccessionHealth();
  const { plan, isLoading: loadingPlan, loadPlan, clear } = useSuccessionManual();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewPlan = async (position: CriticalPosition) => {
    await loadPlan(position.id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    clear();
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical": return "text-red-500 bg-red-500/10";
      case "at_risk": return "text-orange-500 bg-orange-500/10";
      case "high": return "text-orange-500 bg-orange-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      default: return "text-green-500 bg-green-500/10";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "critical": return <XCircle className="h-4 w-4" />;
      case "at_risk": return <AlertTriangle className="h-4 w-4" />;
      case "high": return <AlertTriangle className="h-4 w-4" />;
      case "medium": return <Clock className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case "ready_now": return "bg-green-500";
      case "ready_1_year": return "bg-blue-500";
      case "ready_2_years": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getReadinessLabel = (readiness: string) => {
    switch (readiness) {
      case "ready_now": return "Pronto Agora";
      case "ready_1_year": return "1 Ano";
      case "ready_2_years": return "2 Anos";
      default: return "Em Desenvolvimento";
    }
  };

  if (loadingPositions || loadingHealth) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const uncoveredPositions = healthData 
    ? healthData.totalPositions - healthData.coveredPositions 
    : 0;

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posições Críticas</p>
                <p className="text-2xl font-bold">{healthData?.criticalPositions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cobertas</p>
                <p className="text-2xl font-bold">{healthData?.coveredPositions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Descobertas</p>
                <p className="text-2xl font-bold">{uncoveredPositions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bench Strength</p>
                <p className="text-2xl font-bold">{healthData?.benchStrength || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Positions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Posições Críticas e Planos de Sucessão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="critical">Críticas</TabsTrigger>
              <TabsTrigger value="uncovered">Descobertas</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <PositionsList 
                positions={criticalPositions || []} 
                onViewPlan={handleViewPlan}
                getRiskColor={getRiskColor}
                getRiskIcon={getRiskIcon}
              />
            </TabsContent>

            <TabsContent value="critical">
              <PositionsList 
                positions={(criticalPositions || []).filter(p => p.riskLevel === "critical" || p.importance === "critical")} 
                onViewPlan={handleViewPlan}
                getRiskColor={getRiskColor}
                getRiskIcon={getRiskIcon}
              />
            </TabsContent>

            <TabsContent value="uncovered">
              <PositionsList 
                positions={(criticalPositions || []).filter(p => p.successorCount === 0)} 
                onViewPlan={handleViewPlan}
                getRiskColor={getRiskColor}
                getRiskIcon={getRiskIcon}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Succession Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Plano de Sucessão
            </DialogTitle>
          </DialogHeader>
          
          {loadingPlan ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : plan ? (
            <SuccessionPlanDetails 
              plan={plan} 
              getReadinessColor={getReadinessColor}
              getReadinessLabel={getReadinessLabel}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PositionsList({ 
  positions, 
  onViewPlan, 
  getRiskColor, 
  getRiskIcon 
}: { 
  positions: CriticalPosition[];
  onViewPlan: (position: CriticalPosition) => void;
  getRiskColor: (risk: string) => string;
  getRiskIcon: (risk: string) => React.ReactNode;
}) {
  if (positions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Nenhuma posição encontrada</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3">
        {positions.map((position) => (
          <Card 
            key={position.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewPlan(position)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getRiskColor(position.riskLevel)}`}>
                    {getRiskIcon(position.riskLevel)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{position.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {position.department || "Sem departamento"} • {position.currentHolder?.name || "Vago"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {position.successorCount} sucessor{position.successorCount !== 1 ? "es" : ""}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={getRiskColor(position.riskLevel)}
                    >
                      {position.riskLevel === "critical" ? "Crítico" : 
                       position.riskLevel === "at_risk" ? "Em Risco" :
                       position.riskLevel === "covered" ? "Coberto" : "Médio"}
                    </Badge>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

function SuccessionPlanDetails({ 
  plan, 
  getReadinessColor,
  getReadinessLabel 
}: { 
  plan: SuccessionPlan;
  getReadinessColor: (readiness: string) => string;
  getReadinessLabel: (readiness: string) => string;
}) {
  return (
    <ScrollArea className="h-[70vh]">
      <div className="space-y-6 p-2">
        {/* Position Info */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{plan.position.title}</h3>
                <p className="text-muted-foreground">
                  {plan.position.department} • Ocupante: {plan.position.currentHolder?.name || "Vago"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card className={`border-l-4 ${
          plan.riskAssessment.overallRisk === 'high' ? 'border-l-red-500 bg-red-500/5' :
          plan.riskAssessment.overallRisk === 'medium' ? 'border-l-yellow-500 bg-yellow-500/5' :
          'border-l-green-500 bg-green-500/5'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-5 w-5 ${
                plan.riskAssessment.overallRisk === 'high' ? 'text-red-500' :
                plan.riskAssessment.overallRisk === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`} />
              <h4 className="font-semibold">Avaliação de Risco: {
                plan.riskAssessment.overallRisk === 'high' ? 'Alto' :
                plan.riskAssessment.overallRisk === 'medium' ? 'Médio' : 'Baixo'
              }</h4>
            </div>
            {plan.riskAssessment.factors.length > 0 && (
              <ul className="text-sm text-muted-foreground space-y-1">
                {plan.riskAssessment.factors.map((factor, idx) => (
                  <li key={idx}>• {factor}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Candidates */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Candidatos à Sucessão ({plan.successors.length})
          </h4>

          {plan.successors.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <h5 className="font-semibold text-lg mb-2">Sem Candidatos Identificados</h5>
                <p className="text-muted-foreground">
                  Nenhum colaborador foi identificado como potencial sucessor para esta posição.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {plan.successors.map((candidate, index) => (
                <CandidateCard 
                  key={candidate.userId} 
                  candidate={candidate} 
                  rank={index + 1}
                  getReadinessColor={getReadinessColor}
                  getReadinessLabel={getReadinessLabel}
                />
              ))}
            </div>
          )}
        </div>

        {/* Development Recommendations */}
        {plan.riskAssessment.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.riskAssessment.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}

function CandidateCard({ 
  candidate, 
  rank,
  getReadinessColor,
  getReadinessLabel
}: { 
  candidate: SuccessorCandidate; 
  rank: number;
  getReadinessColor: (readiness: string) => string;
  getReadinessLabel: (readiness: string) => string;
}) {
  const getRankIcon = () => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <Star className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Card className={rank === 1 ? "border-yellow-500/50 bg-yellow-500/5" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1">
            {getRankIcon()}
            <span className="text-xs font-bold">#{rank}</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h5 className="font-semibold">{candidate.name}</h5>
                <p className="text-sm text-muted-foreground">
                  {candidate.currentPosition} • {candidate.department}
                </p>
              </div>
              <Badge className={getReadinessColor(candidate.readiness)}>
                {getReadinessLabel(candidate.readiness)}
              </Badge>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Score de Compatibilidade</span>
                <span className="font-semibold">{candidate.matchScore}%</span>
              </div>
              <Progress value={candidate.matchScore} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="bg-muted rounded p-2">
                <p className="text-muted-foreground">HiPo Score</p>
                <p className="font-semibold">{candidate.hipoScore}%</p>
              </div>
              <div className="bg-muted rounded p-2">
                <p className="text-muted-foreground">Prontidão</p>
                <p className="font-semibold">{candidate.readinessScore}%</p>
              </div>
              <div className="bg-muted rounded p-2">
                <p className="text-muted-foreground">Nível</p>
                <p className="font-semibold">{candidate.level}</p>
              </div>
            </div>

            {candidate.gaps.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Gaps de Desenvolvimento:</p>
                <div className="flex flex-wrap gap-1">
                  {candidate.gaps.map((gap, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {candidate.strengths.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Pontos Fortes:</p>
                <div className="flex flex-wrap gap-1">
                  {candidate.strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
