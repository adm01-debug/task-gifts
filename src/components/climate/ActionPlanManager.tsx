import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActionPlans, useActionPlan, useActionPlanItems, useCreateActionPlan, useCreateActionPlanItem } from "@/hooks/useActionPlans";
import { useDepartments } from "@/hooks/useDepartments";
import { PILLAR_LABELS, ClimatePillar } from "@/services/climateSurveyService";
import { Plus, Target, CheckCircle, Clock, AlertTriangle, ChevronRight, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG = {
  draft: { label: 'Rascunho', color: 'bg-gray-500', icon: Clock },
  active: { label: 'Em andamento', color: 'bg-blue-500', icon: Target },
  completed: { label: 'Concluído', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: AlertTriangle },
};

export function ActionPlanManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const { data: plans = [], isLoading } = useActionPlans(filter !== 'all' ? { status: filter } : undefined);
  const { data: departments = [] } = useDepartments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Planos de Ação (FCA)</h2>
          <p className="text-muted-foreground">Fator → Causa → Ação com metodologia 5W2H</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Plano de Ação</DialogTitle>
            </DialogHeader>
            <CreateActionPlanForm onSuccess={() => setIsCreateOpen(false)} departments={departments} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Em andamento</TabsTrigger>
          <TabsTrigger value="draft">Rascunhos</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Lista de planos */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-32" />
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum plano de ação encontrado</p>
            <p className="text-muted-foreground">Crie seu primeiro plano para melhorar os indicadores</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map(plan => {
            const StatusIcon = STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG]?.icon || Clock;
            return (
              <Card key={plan.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPlanId(plan.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG]?.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG]?.label}
                        </Badge>
                        {plan.pillar && (
                          <Badge variant="outline">
                            {PILLAR_LABELS[plan.pillar as ClimatePillar]?.pt}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{plan.title}</h3>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span>Prazo: {format(new Date(plan.target_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                        {plan.initial_score && plan.target_score && (
                          <span>Meta: {plan.initial_score} → {plan.target_score}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{plan.progress_percent}%</p>
                        <Progress value={plan.progress_percent} className="w-24 h-2" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de detalhes do plano */}
      {selectedPlanId && (
        <Dialog open={!!selectedPlanId} onOpenChange={() => setSelectedPlanId(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ActionPlanDetail planId={selectedPlanId} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CreateActionPlanForm({ onSuccess, departments }: { onSuccess: () => void; departments: any[] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pillar, setPillar] = useState<ClimatePillar | ''>('');
  const [initialScore, setInitialScore] = useState('');
  const [targetScore, setTargetScore] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [rootCauses, setRootCauses] = useState(['', '', '', '', '']);
  const [rootCauseSummary, setRootCauseSummary] = useState('');

  const { mutate: createPlan, isPending } = useCreateActionPlan();

  const handleSubmit = () => {
    if (!title || !targetDate) return;

    createPlan({
      title,
      description: description || undefined,
      pillar: pillar as ClimatePillar || undefined,
      initialScore: initialScore ? parseInt(initialScore) : undefined,
      targetScore: targetScore ? parseInt(targetScore) : undefined,
      targetDate,
      departmentId: departmentId || undefined,
      rootCauses: rootCauses.filter(r => r.trim()),
      rootCauseSummary: rootCauseSummary || undefined,
    }, {
      onSuccess,
    });
  };

  return (
    <div className="space-y-6">
      {/* Fator */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Fator (O que está errado?)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Nome do Plano *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Melhorar Reconhecimento" className="mt-1" />
            </div>
            <div>
              <Label>Pilar do Clima</Label>
              <Select value={pillar} onValueChange={(v) => setPillar(v as ClimatePillar)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o pilar" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PILLAR_LABELS).map(([key, { pt }]) => (
                    <SelectItem key={key} value={key}>{pt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o problema a ser resolvido" className="mt-1" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Score Atual</Label>
              <Input type="number" value={initialScore} onChange={(e) => setInitialScore(e.target.value)} placeholder="0-100" className="mt-1" />
            </div>
            <div>
              <Label>Meta</Label>
              <Input type="number" value={targetScore} onChange={(e) => setTargetScore(e.target.value)} placeholder="0-100" className="mt-1" />
            </div>
            <div>
              <Label>Prazo *</Label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="mt-1" />
            </div>
          </div>
          {departments.length > 0 && (
            <div>
              <Label>Departamento</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Causa (5 Porquês) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Causa (5 Porquês)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rootCauses.map((cause, index) => (
            <div key={index}>
              <Label className="text-xs text-muted-foreground">Por quê? ({index + 1})</Label>
              <Input
                value={cause}
                onChange={(e) => {
                  const newCauses = [...rootCauses];
                  newCauses[index] = e.target.value;
                  setRootCauses(newCauses);
                }}
                placeholder={index === 0 ? "Por que o problema está acontecendo?" : "Por quê?"}
                className="mt-1"
              />
            </div>
          ))}
          <div>
            <Label>Causa Raiz (resumo)</Label>
            <Input value={rootCauseSummary} onChange={(e) => setRootCauseSummary(e.target.value)} placeholder="Resumo da causa raiz identificada" className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={!title || !targetDate || isPending} className="w-full">
        {isPending ? 'Criando...' : 'Criar Plano de Ação'}
      </Button>
    </div>
  );
}

function ActionPlanDetail({ planId }: { planId: string }) {
  const { data: plan } = useActionPlan(planId);
  const { data: items = [] } = useActionPlanItems(planId);
  const [isAddingItem, setIsAddingItem] = useState(false);

  if (!plan) return null;

  const StatusIcon = STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG]?.icon || Clock;

  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG]?.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG]?.label}
          </Badge>
          {plan.pillar && (
            <Badge variant="outline">{PILLAR_LABELS[plan.pillar as ClimatePillar]?.pt}</Badge>
          )}
        </div>
        <DialogTitle>{plan.title}</DialogTitle>
        {plan.description && <p className="text-muted-foreground">{plan.description}</p>}
      </DialogHeader>

      {/* Progresso */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-2xl font-bold">{plan.progress_percent}%</span>
          </div>
          <Progress value={plan.progress_percent} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Início: {plan.initial_score || '-'}</span>
            <span>Atual: {plan.current_score || plan.initial_score || '-'}</span>
            <span>Meta: {plan.target_score || '-'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Ações 5W2H */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Ações (5W2H)</h3>
          <Button size="sm" onClick={() => setIsAddingItem(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Ação
          </Button>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma ação cadastrada ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">Ação {index + 1}</span>
                        <Badge variant="outline" className="text-xs">{item.priority}</Badge>
                        <Badge variant={item.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {item.status === 'completed' ? 'Concluída' : item.status === 'in_progress' ? 'Em andamento' : 'Pendente'}
                        </Badge>
                      </div>
                      <p className="font-medium">{item.what_title}</p>
                      {item.what_description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.what_description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                        {item.when_end && <span>Prazo: {format(new Date(item.when_end), "dd/MM/yyyy")}</span>}
                        {item.how_method && <span>Como: {item.how_method}</span>}
                        {item.how_much_cost && <span>Custo: R$ {item.how_much_cost}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{item.progress_percent}%</p>
                      <Progress value={item.progress_percent} className="w-20 h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de adicionar ação */}
      {isAddingItem && (
        <AddActionItemForm planId={planId} onClose={() => setIsAddingItem(false)} />
      )}
    </div>
  );
}

function AddActionItemForm({ planId, onClose }: { planId: string; onClose: () => void }) {
  const [whatTitle, setWhatTitle] = useState('');
  const [whatDescription, setWhatDescription] = useState('');
  const [whyReason, setWhyReason] = useState('');
  const [whenEnd, setWhenEnd] = useState('');
  const [howMethod, setHowMethod] = useState('');
  const [howMuchCost, setHowMuchCost] = useState('');
  const [priority, setPriority] = useState('medium');

  const { mutate: createItem, isPending } = useCreateActionPlanItem();

  const handleSubmit = () => {
    if (!whatTitle) return;

    // Para simplificar, usamos um ID placeholder para o responsável
    createItem({
      planId,
      whatTitle,
      whatDescription: whatDescription || undefined,
      whyReason: whyReason || undefined,
      whenEnd: whenEnd || undefined,
      whoResponsibleId: 'placeholder', // Seria o ID do usuário selecionado
      howMethod: howMethod || undefined,
      howMuchCost: howMuchCost ? parseFloat(howMuchCost) : undefined,
      priority,
    }, {
      onSuccess: onClose,
    });
  };

  return (
    <Card className="mt-4 border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Nova Ação (5W2H)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>O quê? (What) *</Label>
          <Input value={whatTitle} onChange={(e) => setWhatTitle(e.target.value)} placeholder="Título da ação" className="mt-1" />
        </div>
        <div>
          <Label>Descrição</Label>
          <Textarea value={whatDescription} onChange={(e) => setWhatDescription(e.target.value)} placeholder="Detalhes da ação" className="mt-1" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Por quê? (Why)</Label>
            <Input value={whyReason} onChange={(e) => setWhyReason(e.target.value)} placeholder="Motivo da ação" className="mt-1" />
          </div>
          <div>
            <Label>Quando? (When)</Label>
            <Input type="date" value={whenEnd} onChange={(e) => setWhenEnd(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Como? (How)</Label>
            <Input value={howMethod} onChange={(e) => setHowMethod(e.target.value)} placeholder="Método/processo" className="mt-1" />
          </div>
          <div>
            <Label>Quanto? (How Much)</Label>
            <Input type="number" value={howMuchCost} onChange={(e) => setHowMuchCost(e.target.value)} placeholder="R$ 0,00" className="mt-1" />
          </div>
        </div>
        <div>
          <Label>Prioridade</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!whatTitle || isPending} className="flex-1">
            {isPending ? 'Salvando...' : 'Adicionar Ação'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
