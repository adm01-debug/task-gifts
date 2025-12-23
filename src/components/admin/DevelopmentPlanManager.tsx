import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  XCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Users,
  BookOpen,
  Award,
  Briefcase,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  useDevelopmentPlans,
  useDevelopmentPlan,
  useCreateDevelopmentPlan,
  useUpdateDevelopmentPlan,
  useDeleteDevelopmentPlan,
  useCreatePlanAction,
  useUpdatePlanAction,
  useDeletePlanAction,
  useCompetencies,
} from "@/hooks/useDevelopmentPlans";
import { useProfiles } from "@/hooks/useProfiles";
import { ACTION_TYPES, PRIORITY_COLORS } from "@/services/developmentPlanService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const ACTION_STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
  cancelled: XCircle,
};

export function DevelopmentPlanManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());

  const { data: plans, isLoading } = useDevelopmentPlans(undefined, statusFilter !== "all" ? statusFilter : undefined);
  const { data: profiles } = useProfiles();
  const deletePlan = useDeleteDevelopmentPlan();

  const filteredPlans = plans?.filter((plan) => {
    const profile = profiles?.find((p) => p.id === plan.user_id);
    const searchLower = searchQuery.toLowerCase();
    return (
      plan.title.toLowerCase().includes(searchLower) ||
      profile?.display_name?.toLowerCase().includes(searchLower) ||
      profile?.email?.toLowerCase().includes(searchLower)
    );
  });

  const toggleExpand = (planId: string) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };

  const calculateProgress = (plan: typeof plans extends (infer T)[] | undefined ? T : never) => {
    // For now, we don't have actions loaded in the list view
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Planos de Desenvolvimento Individual (PDI)
          </h2>
          <p className="text-muted-foreground">
            Gerencie os planos de desenvolvimento dos colaboradores
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar planos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[200px]"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo PDI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <CreatePlanForm
                profiles={profiles || []}
                onClose={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total de PDIs", value: plans?.length || 0, color: "#6366f1", icon: FileText },
          { label: "Ativos", value: plans?.filter((p) => p.status === "active").length || 0, color: "#3b82f6", icon: Clock },
          { label: "Concluídos", value: plans?.filter((p) => p.status === "completed").length || 0, color: "#10b981", icon: CheckCircle2 },
          { label: "Colaboradores", value: new Set(plans?.map((p) => p.user_id)).size, color: "#8b5cf6", icon: Users },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Plans List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Planos de Desenvolvimento</CardTitle>
          <CardDescription>
            {filteredPlans?.length || 0} planos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredPlans?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum plano encontrado
            </div>
          ) : (
            <AnimatePresence>
              {filteredPlans?.map((plan, index) => {
                const profile = profiles?.find((p) => p.id === plan.user_id);
                const isExpanded = expandedPlans.has(plan.id);

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(plan.id)}>
                      <Card className="border-border/50 hover:border-primary/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>

                            <Avatar className="w-10 h-10">
                              <AvatarImage src={profile?.avatar_url || ""} />
                              <AvatarFallback>{profile?.display_name?.charAt(0)}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold truncate">{plan.title}</h4>
                                <Badge className={STATUS_COLORS[plan.status]}>
                                  {STATUS_LABELS[plan.status]}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {profile?.display_name} • Início:{" "}
                                {format(new Date(plan.start_date), "dd/MM/yyyy")}
                                {plan.target_date && ` • Meta: ${format(new Date(plan.target_date), "dd/MM/yyyy")}`}
                              </p>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedPlan(plan.id)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deletePlan.mutate(plan.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <CollapsibleContent>
                            <PlanDetailInline planId={plan.id} />
                          </CollapsibleContent>
                        </CardContent>
                      </Card>
                    </Collapsible>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* Plan Detail Dialog */}
      <Dialog open={selectedPlan !== null} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedPlan && (
            <PlanDetailView planId={selectedPlan} profiles={profiles || []} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Plan Form
function CreatePlanForm({
  profiles,
  onClose,
}: {
  profiles: { id: string; display_name: string; avatar_url: string | null }[];
  onClose: () => void;
}) {
  const [selectedUser, setSelectedUser] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const createPlan = useCreateDevelopmentPlan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !title) return;

    await createPlan.mutateAsync({
      user_id: selectedUser,
      title,
      description: description || undefined,
      target_date: targetDate || undefined,
      status: "active",
    });

    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Novo Plano de Desenvolvimento</DialogTitle>
        <DialogDescription>
          Crie um PDI para um colaborador
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Colaborador</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={profile.avatar_url || ""} />
                      <AvatarFallback>{profile.display_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {profile.display_name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Título do Plano</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex: Desenvolvimento de Liderança"
          />
        </div>

        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Objetivos e contexto do plano..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Data Alvo</Label>
          <Input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!selectedUser || !title || createPlan.isPending}>
            {createPlan.isPending ? "Criando..." : "Criar PDI"}
          </Button>
        </div>
      </form>
    </>
  );
}

// Plan Detail Inline (for collapsible)
function PlanDetailInline({ planId }: { planId: string }) {
  const { data: plan, isLoading } = useDevelopmentPlan(planId);
  const [showAddAction, setShowAddAction] = useState(false);
  const createAction = useCreatePlanAction();
  const updateAction = useUpdatePlanAction();
  const deleteAction = useDeletePlanAction();
  const { data: competencies } = useCompetencies();

  const [newAction, setNewAction] = useState({
    title: "",
    description: "",
    action_type: "learning",
    priority: "medium",
    due_date: "",
  });

  const handleAddAction = async () => {
    if (!newAction.title) return;

    await createAction.mutateAsync({
      plan_id: planId,
      title: newAction.title,
      description: newAction.description || undefined,
      action_type: newAction.action_type,
      priority: newAction.priority,
      due_date: newAction.due_date || undefined,
    });

    setNewAction({ title: "", description: "", action_type: "learning", priority: "medium", due_date: "" });
    setShowAddAction(false);
  };

  if (isLoading) {
    return <div className="mt-4 text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
      {plan?.description && (
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      )}

      <div className="flex items-center justify-between">
        <h5 className="font-medium text-sm">Ações ({plan?.actions?.length || 0})</h5>
        <Button size="sm" variant="outline" onClick={() => setShowAddAction(!showAddAction)}>
          <Plus className="w-3 h-3 mr-1" />
          Ação
        </Button>
      </div>

      {showAddAction && (
        <Card className="p-3 bg-muted/30">
          <div className="space-y-3">
            <Input
              placeholder="Título da ação..."
              value={newAction.title}
              onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={newAction.action_type}
                onValueChange={(v) => setNewAction({ ...newAction, action_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACTION_TYPES).map(([key, { label, icon }]) => (
                    <SelectItem key={key} value={key}>
                      {icon} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newAction.priority}
                onValueChange={(v) => setNewAction({ ...newAction, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newAction.due_date}
                onChange={(e) => setNewAction({ ...newAction, due_date: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowAddAction(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleAddAction} disabled={!newAction.title}>
                Adicionar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {plan?.actions?.map((action) => {
          const StatusIcon = ACTION_STATUS_ICONS[action.status];
          const typeInfo = ACTION_TYPES[action.action_type] || ACTION_TYPES.other;

          return (
            <div
              key={action.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() =>
                  updateAction.mutate({
                    id: action.id,
                    status: action.status === "completed" ? "pending" : "completed",
                  })
                }
              >
                <StatusIcon
                  className={`w-4 h-4 ${
                    action.status === "completed" ? "text-green-500" : "text-muted-foreground"
                  }`}
                />
              </Button>

              <span className="text-sm">{typeInfo.icon}</span>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    action.status === "completed" ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {action.title}
                </p>
                {action.due_date && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(action.due_date), "dd/MM/yyyy")}
                  </p>
                )}
              </div>

              <Badge className={`text-xs ${PRIORITY_COLORS[action.priority]}`}>
                {action.priority}
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={() => deleteAction.mutate(action.id)}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Plan Detail View (for dialog)
function PlanDetailView({
  planId,
  profiles,
}: {
  planId: string;
  profiles: { id: string; display_name: string; avatar_url: string | null }[];
}) {
  const { data: plan, isLoading } = useDevelopmentPlan(planId);
  const updatePlan = useUpdateDevelopmentPlan();

  if (isLoading || !plan) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const profile = profiles.find((p) => p.id === plan.user_id);
  const completedActions = plan.actions?.filter((a) => a.status === "completed").length || 0;
  const totalActions = plan.actions?.length || 0;
  const progressPercent = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{plan.title}</DialogTitle>
        <DialogDescription>
          PDI de {profile?.display_name}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 space-y-6">
        {/* Progress Overview */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback>{profile?.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso Geral</span>
                  <span className="text-sm text-muted-foreground">
                    {completedActions}/{totalActions} ações
                  </span>
                </div>
                <Progress value={progressPercent} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{progressPercent}%</p>
                <Badge className={STATUS_COLORS[plan.status]}>{STATUS_LABELS[plan.status]}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Update */}
        <div className="flex items-center gap-2">
          <Label className="min-w-fit">Status:</Label>
          <Select
            value={plan.status}
            onValueChange={(status) => updatePlan.mutate({ id: planId, status: status as any })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions Detail */}
        <PlanDetailInline planId={planId} />
      </div>
    </>
  );
}
