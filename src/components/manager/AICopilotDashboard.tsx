import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  AlertTriangle,
  TrendingDown,
  Calendar,
  MessageSquare,
  Target,
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  Clock,
  Frown,
  Meh,
  Smile,
  X,
  Sparkles,
  UserPlus,
  FileText,
  Award,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useProfiles } from "@/hooks/useProfiles";
import { useChurnPrediction } from "@/hooks/useChurnPrediction";
import { useDevelopmentPlans } from "@/hooks/useDevelopmentPlans";
import { useNineBoxEvaluations } from "@/hooks/useNineBox";
import { useGoals } from "@/hooks/useGoals";
import { BOX_LABELS } from "@/services/nineBoxService";
import { formatDistanceToNow, differenceInDays, isAfter, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CopilotAlert {
  id: string;
  type: "urgent" | "warning" | "positive" | "suggestion";
  icon: React.ElementType;
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  }[];
  metadata?: Record<string, unknown>;
}

interface CopilotSuggestion {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export function AICopilotDashboard() {
  const navigate = useNavigate();
  const { data: profiles } = useProfiles();
  const { predictions } = useChurnPrediction();
  const { data: plans } = useDevelopmentPlans();
  const { data: evaluations } = useNineBoxEvaluations();
  const { goals } = useGoals();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Generate contextual alerts based on data
  const alerts = useMemo<CopilotAlert[]>(() => {
    const generatedAlerts: CopilotAlert[] = [];

    // 1. High churn risk alerts
    predictions
      ?.filter((p) => p.riskLevel === "high")
      .forEach((prediction) => {
        const profile = profiles?.find((p) => p.id === prediction.userId);
        if (profile) {
          generatedAlerts.push({
            id: `churn-${prediction.userId}`,
            type: "urgent",
            icon: AlertTriangle,
            title: `${profile.display_name} com alto risco de saída`,
            description: `Risco de ${Math.round(prediction.riskScore * 100)}% baseado em engajamento e atividades recentes.`,
            userId: profile.id,
            userName: profile.display_name || "Colaborador",
            userAvatar: profile.avatar_url || undefined,
            actions: [
              {
                label: "Agendar 1-on-1",
                onClick: () => navigate("/checkins"),
                variant: "default",
              },
            ],
          });
        }
      });

    // 2. Overdue PDIs
    plans
      ?.filter((p) => {
        if (p.status !== "active" || !p.target_date) return false;
        return new Date(p.target_date) < new Date();
      })
      .slice(0, 3)
      .forEach((plan) => {
        const profile = profiles?.find((p) => p.id === plan.user_id);
        const daysOverdue = differenceInDays(new Date(), new Date(plan.target_date!));
        generatedAlerts.push({
          id: `pdi-overdue-${plan.id}`,
          type: "warning",
          icon: FileText,
          title: `PDI de ${profile?.display_name || "colaborador"} atrasado`,
          description: `"${plan.title}" está ${daysOverdue} dias atrasado. Considere revisar metas.`,
          userId: profile?.id,
          userName: profile?.display_name || "Colaborador",
          userAvatar: profile?.avatar_url || undefined,
          actions: [
            {
              label: "Ver PDI",
              onClick: () => navigate("/admin?tab=development"),
              variant: "outline",
            },
          ],
        });
      });

    // 3. Low performers (Box 1, 2) without PDI
    evaluations
      ?.filter((e) => e.box_position <= 2)
      .forEach((evaluation) => {
        const hasPDI = plans?.some((p) => p.user_id === evaluation.user_id && p.status === "active");
        if (!hasPDI) {
          const profile = profiles?.find((p) => p.id === evaluation.user_id);
          generatedAlerts.push({
            id: `lowperf-no-pdi-${evaluation.id}`,
            type: "warning",
            icon: Target,
            title: `${profile?.display_name || "Colaborador"} precisa de PDI`,
            description: `Avaliado como "${BOX_LABELS[evaluation.box_position]?.name}" sem plano de desenvolvimento ativo.`,
            userId: profile?.id,
            userName: profile?.display_name || "Colaborador",
            userAvatar: profile?.avatar_url || undefined,
            actions: [
              {
                label: "Criar PDI",
                onClick: () => navigate("/admin?tab=development"),
                variant: "default",
              },
            ],
          });
        }
      });

    // 4. OKRs at risk
    goals
      ?.filter((g) => {
        if (!g.due_date) return false;
        const dueDate = new Date(g.due_date);
        const now = new Date();
        const daysUntilDue = differenceInDays(dueDate, now);
        // At risk: less than 30 days and progress < 50%
        return daysUntilDue < 30 && daysUntilDue > 0 && (g.progress_percent || 0) < 50;
      })
      .slice(0, 2)
      .forEach((goal) => {
        generatedAlerts.push({
          id: `okr-risk-${goal.id}`,
          type: "warning",
          icon: TrendingDown,
          title: `OKR "${goal.title}" em risco`,
          description: `Apenas ${goal.progress_percent || 0}% concluído com menos de 30 dias para o prazo.`,
          actions: [
            {
              label: "Ver OKR",
              onClick: () => navigate("/goals"),
              variant: "outline",
            },
          ],
        });
      });

    // 5. Positive alerts - High performers
    evaluations
      ?.filter((e) => e.box_position >= 8)
      .slice(0, 2)
      .forEach((evaluation) => {
        const profile = profiles?.find((p) => p.id === evaluation.user_id);
        generatedAlerts.push({
          id: `hipo-${evaluation.id}`,
          type: "positive",
          icon: Award,
          title: `${profile?.display_name || "Colaborador"} é um Top Talent!`,
          description: `Avaliado como "${BOX_LABELS[evaluation.box_position]?.name}". Considere retenção e desenvolvimento acelerado.`,
          userId: profile?.id,
          userName: profile?.display_name || "Colaborador",
          userAvatar: profile?.avatar_url || undefined,
          actions: [
            {
              label: "Plano de Retenção",
              onClick: () => navigate("/admin?tab=development"),
              variant: "outline",
            },
          ],
        });
      });

    return generatedAlerts.filter((a) => !dismissedAlerts.includes(a.id));
  }, [profiles, predictions, plans, evaluations, goals, dismissedAlerts]);

  // Generate smart suggestions
  const suggestions = useMemo<CopilotSuggestion[]>(() => {
    const generatedSuggestions: CopilotSuggestion[] = [];

    // Check for team members without recent 1-on-1
    const inactiveMembers = profiles?.filter((p) => {
      const daysSinceUpdate = differenceInDays(new Date(), new Date(p.updated_at));
      return daysSinceUpdate > 14;
    }).length || 0;

    if (inactiveMembers > 0) {
      generatedSuggestions.push({
        id: "inactive-members",
        icon: Calendar,
        title: "Agende 1-on-1 com membros inativos",
        description: `${inactiveMembers} membro(s) sem interação há mais de 14 dias. 1-on-1s regulares aumentam engajamento em 30%.`,
        priority: "high",
      });
    }

    // PDI completion rate suggestion
    const activePlans = plans?.filter((p) => p.status === "active").length || 0;
    const completedPlans = plans?.filter((p) => p.status === "completed").length || 0;
    const completionRate = activePlans + completedPlans > 0 
      ? Math.round((completedPlans / (activePlans + completedPlans)) * 100) 
      : 0;

    if (completionRate < 50) {
      generatedSuggestions.push({
        id: "pdi-completion",
        icon: Target,
        title: "Melhore a taxa de conclusão de PDIs",
        description: `Taxa atual: ${completionRate}%. Considere revisar metas mais frequentemente e oferecer suporte adicional.`,
        priority: "medium",
      });
    }

    // 9-Box coverage
    const totalProfiles = profiles?.length || 0;
    const evaluatedCount = new Set(evaluations?.map((e) => e.user_id)).size;
    const coveragePercent = totalProfiles > 0 ? Math.round((evaluatedCount / totalProfiles) * 100) : 0;

    if (coveragePercent < 80) {
      generatedSuggestions.push({
        id: "ninebox-coverage",
        icon: Brain,
        title: "Complete as avaliações 9-Box",
        description: `Apenas ${coveragePercent}% da equipe foi avaliada. Avaliações completas permitem melhor planejamento de sucessão.`,
        priority: "medium",
      });
    }

    // High performers development
    const highPerformers = evaluations?.filter((e) => e.box_position >= 7).length || 0;
    if (highPerformers > 0) {
      generatedSuggestions.push({
        id: "develop-hipos",
        icon: Sparkles,
        title: "Desenvolva seus High Potentials",
        description: `Você tem ${highPerformers} colaborador(es) de alto potencial. Considere programas de mentoria e projetos desafiadores.`,
        priority: "low",
      });
    }

    return generatedSuggestions;
  }, [profiles, plans, evaluations]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => [...prev, alertId]);
  };

  const getAlertStyle = (type: CopilotAlert["type"]) => {
    switch (type) {
      case "urgent":
        return "bg-red-500/10 border-red-500/30 hover:border-red-500/50";
      case "warning":
        return "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50";
      case "positive":
        return "bg-green-500/10 border-green-500/30 hover:border-green-500/50";
      case "suggestion":
        return "bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50";
      default:
        return "bg-muted/30 border-border/50";
    }
  };

  const getAlertIconColor = (type: CopilotAlert["type"]) => {
    switch (type) {
      case "urgent":
        return "text-red-500";
      case "warning":
        return "text-amber-500";
      case "positive":
        return "text-green-500";
      case "suggestion":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  const urgentAlerts = alerts.filter((a) => a.type === "urgent");
  const warningAlerts = alerts.filter((a) => a.type === "warning");
  const positiveAlerts = alerts.filter((a) => a.type === "positive");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            IA Copilot
          </h2>
          <p className="text-muted-foreground">
            Alertas inteligentes e sugestões personalizadas para sua equipe
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Zap className="w-3 h-3" />
          {alerts.length} alertas ativos
        </Badge>
      </div>

      {/* Urgent Alerts Section */}
      {urgentAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-red-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            URGENTE - Ação Imediata Necessária
          </h3>
          <div className="space-y-2">
            <AnimatePresence>
              {urgentAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`border ${getAlertStyle(alert.type)} transition-all`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-red-500/20`}>
                          <alert.icon className={`w-5 h-5 ${getAlertIconColor(alert.type)}`} />
                        </div>
                        {alert.userAvatar !== undefined && (
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={alert.userAvatar || ""} />
                            <AvatarFallback>{alert.userName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{alert.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{alert.description}</p>
                          {alert.actions && alert.actions.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {alert.actions.map((action, idx) => (
                                <Button
                                  key={idx}
                                  size="sm"
                                  variant={action.variant || "default"}
                                  onClick={action.onClick}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Warning & Positive Alerts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Warning Alerts */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
              <Clock className="w-5 h-5" />
              Atenção Necessária
            </CardTitle>
            <CardDescription>Itens que requerem acompanhamento</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-3">
                <AnimatePresence>
                  {warningAlerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-500" />
                      <p>Tudo em ordem!</p>
                    </div>
                  ) : (
                    warningAlerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-3 rounded-lg border ${getAlertStyle(alert.type)}`}
                      >
                        <div className="flex items-start gap-3">
                          <alert.icon className={`w-5 h-5 ${getAlertIconColor(alert.type)} shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-6 w-6"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Positive Alerts */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-500">
              <Award className="w-5 h-5" />
              Boas Notícias
            </CardTitle>
            <CardDescription>Destaques positivos da equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-3">
                <AnimatePresence>
                  {positiveAlerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Meh className="w-10 h-10 mx-auto mb-2" />
                      <p>Aguardando destaques...</p>
                    </div>
                  ) : (
                    positiveAlerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-3 rounded-lg border ${getAlertStyle(alert.type)}`}
                      >
                        <div className="flex items-start gap-3">
                          {alert.userAvatar !== undefined && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={alert.userAvatar || ""} />
                              <AvatarFallback>{alert.userName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Smart Suggestions */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Sugestões Inteligentes
          </CardTitle>
          <CardDescription>Recomendações baseadas em análise de dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {suggestions.map((suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <suggestion.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{suggestion.title}</p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          suggestion.priority === "high"
                            ? "border-red-500/50 text-red-500"
                            : suggestion.priority === "medium"
                            ? "border-amber-500/50 text-amber-500"
                            : "border-muted-foreground/50"
                        }`}
                      >
                        {suggestion.priority === "high" ? "Alta" : suggestion.priority === "medium" ? "Média" : "Baixa"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
            {suggestions.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <Smile className="w-10 h-10 mx-auto mb-2 text-green-500" />
                <p>Excelente! Nenhuma sugestão pendente.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
