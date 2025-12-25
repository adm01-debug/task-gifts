import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useDevelopmentPlans, useMyDevelopmentPlans, useCreatePlanAction, useUpdatePlanAction } from "@/hooks/useDevelopmentPlans";
import { 
  Target, Plus, ChevronDown, ChevronRight, Calendar, Clock, 
  CheckCircle2, Circle, AlertCircle, BookOpen, Users, Award,
  Edit, Trash2, GraduationCap, Briefcase
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PDIObjective {
  id: string;
  title: string;
  competency: string;
  currentScore: number;
  targetScore: number;
  deadline: string;
  actions: PDIAction[];
  isExpanded?: boolean;
}

interface PDIAction {
  id: string;
  title: string;
  type: 'course' | 'mentorship' | 'project' | 'event' | 'other';
  status: 'pending' | 'in_progress' | 'completed';
  platform?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  cost?: number;
  mentor?: string;
}

const mockObjectives: PDIObjective[] = [
  {
    id: '1',
    title: 'Liderança',
    competency: 'Liderança',
    currentScore: 7.3,
    targetScore: 8.5,
    deadline: '2025-12-31',
    isExpanded: true,
    actions: [
      { id: 'a1', title: 'Curso: Liderança Ágil', type: 'course', status: 'completed', platform: 'Udemy', duration: '20h', cost: 150 },
      { id: 'a2', title: 'Mentoria com Diretor Técnico', type: 'mentorship', status: 'in_progress', mentor: 'Carlos Lima', duration: '12 meses' },
      { id: 'a3', title: 'Liderar Projeto "Refatoração API"', type: 'project', status: 'pending', startDate: '2025-03-01', endDate: '2025-06-30' },
      { id: 'a4', title: 'Participar de conferência tech', type: 'event', status: 'pending', platform: 'QCon SP 2025' },
    ]
  },
  {
    id: '2',
    title: 'Inovação',
    competency: 'Inovação e Criatividade',
    currentScore: 8.0,
    targetScore: 9.0,
    deadline: '2025-12-31',
    actions: [
      { id: 'a5', title: 'Workshop de Design Thinking', type: 'course', status: 'completed' },
      { id: 'a6', title: 'Hackathon Interno Q2', type: 'event', status: 'pending' },
    ]
  }
];

const getActionIcon = (type: string) => {
  switch (type) {
    case 'course': return <GraduationCap className="h-4 w-4" />;
    case 'mentorship': return <Users className="h-4 w-4" />;
    case 'project': return <Briefcase className="h-4 w-4" />;
    case 'event': return <Award className="h-4 w-4" />;
    default: return <BookOpen className="h-4 w-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
    default: return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed': return <Badge className="bg-green-500/20 text-green-500">Concluído</Badge>;
    case 'in_progress': return <Badge className="bg-blue-500/20 text-blue-500">Em Andamento</Badge>;
    default: return <Badge variant="outline">Pendente</Badge>;
  }
};

export const PDIFullDashboard = () => {
  const [objectives, setObjectives] = useState<PDIObjective[]>(mockObjectives);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);

  const totalActions = objectives.reduce((sum, obj) => sum + obj.actions.length, 0);
  const completedActions = objectives.reduce((sum, obj) => 
    sum + obj.actions.filter(a => a.status === 'completed').length, 0
  );
  const progressPercent = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  const toggleObjective = (id: string) => {
    setObjectives(prev => prev.map(obj => 
      obj.id === id ? { ...obj, isExpanded: !obj.isExpanded } : obj
    ));
  };

  const updateActionStatus = (objectiveId: string, actionId: string, status: PDIAction['status']) => {
    setObjectives(prev => prev.map(obj => {
      if (obj.id === objectiveId) {
        return {
          ...obj,
          actions: obj.actions.map(action => 
            action.id === actionId ? { ...action, status } : action
          )
        };
      }
      return obj;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Progresso Geral</p>
                <p className="text-3xl font-bold">{progressPercent}%</p>
                <p className="text-sm text-muted-foreground">{completedActions}/{totalActions} ações</p>
              </div>
              <Target className="h-12 w-12 text-primary opacity-80" />
            </div>
            <Progress value={progressPercent} className="h-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Objetivos</p>
                <p className="text-3xl font-bold">{objectives.length}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próxima Revisão</p>
                <p className="text-lg font-bold">01/04/2025</p>
                <p className="text-xs text-muted-foreground">Trimestral</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="objectives" className="space-y-4">
        <TabsList>
          <TabsTrigger value="objectives">Objetivos</TabsTrigger>
          <TabsTrigger value="timeline">Cronograma</TabsTrigger>
          <TabsTrigger value="reviews">Revisões</TabsTrigger>
        </TabsList>

        <TabsContent value="objectives" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Objetivo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Objetivo de Desenvolvimento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Competência</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="leadership">Liderança</SelectItem>
                          <SelectItem value="communication">Comunicação</SelectItem>
                          <SelectItem value="innovation">Inovação</SelectItem>
                          <SelectItem value="teamwork">Trabalho em Equipe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Score Atual</Label>
                      <Input type="number" step="0.1" min="0" max="10" placeholder="7.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Meta</Label>
                      <Input type="number" step="0.1" min="0" max="10" placeholder="8.5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Prazo</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <Button className="w-full">Criar Objetivo</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {objectives.map((objective) => {
            const objProgress = objective.actions.length > 0 
              ? Math.round((objective.actions.filter(a => a.status === 'completed').length / objective.actions.length) * 100)
              : 0;

            return (
              <Card key={objective.id} className="overflow-hidden">
                <Collapsible open={objective.isExpanded} onOpenChange={() => toggleObjective(objective.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {objective.isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              🎯 {objective.title}
                              <Badge variant="outline">{objective.competency}</Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Score: {objective.currentScore} → {objective.targetScore} | Prazo: {format(new Date(objective.deadline), "dd/MM/yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold">{objProgress}%</p>
                            <p className="text-xs text-muted-foreground">{objective.actions.filter(a => a.status === 'completed').length}/{objective.actions.length} ações</p>
                          </div>
                          <Progress value={objProgress} className="w-24 h-2" />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="border-t pt-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground">Ações de Desenvolvimento</h4>
                        
                        {objective.actions.map((action) => (
                          <div 
                            key={action.id} 
                            className="flex items-start justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <button 
                                onClick={() => updateActionStatus(
                                  objective.id, 
                                  action.id, 
                                  action.status === 'completed' ? 'pending' : 
                                  action.status === 'pending' ? 'in_progress' : 'completed'
                                )}
                                className="mt-0.5"
                              >
                                {getStatusIcon(action.status)}
                              </button>
                              <div>
                                <div className="flex items-center gap-2">
                                  {getActionIcon(action.type)}
                                  <span className={`font-medium ${action.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                    {action.title}
                                  </span>
                                  {getStatusBadge(action.status)}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                  {action.platform && <span>📱 {action.platform}</span>}
                                  {action.duration && <span>⏱️ {action.duration}</span>}
                                  {action.mentor && <span>👤 {action.mentor}</span>}
                                  {action.cost && <span>💰 R$ {action.cost}</span>}
                                  {action.startDate && <span>📅 {format(new Date(action.startDate), "dd/MM/yyyy")}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Ação
                        </Button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Desenvolvimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'].map((quarter, idx) => (
                  <div key={quarter} className="flex items-start gap-4">
                    <div className="w-20 text-sm font-medium text-muted-foreground">{quarter}</div>
                    <div className="flex-1 space-y-2">
                      {objectives.flatMap(obj => 
                        obj.actions.filter(a => {
                          if (!a.startDate && !a.endDate) return idx === 0;
                          return true;
                        }).slice(0, 2)
                      ).map((action, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm">
                          {getActionIcon(action.type)}
                          <span>{action.title}</span>
                          {getStatusBadge(action.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Revisões Agendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: '01/04/2025', type: 'Trimestral', status: 'upcoming' },
                  { date: '01/07/2025', type: 'Semestral', status: 'upcoming' },
                  { date: '01/10/2025', type: 'Trimestral', status: 'upcoming' },
                  { date: '31/12/2025', type: 'Anual - Fechamento', status: 'upcoming' },
                ].map((review, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{review.date}</p>
                        <p className="text-sm text-muted-foreground">{review.type}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Agendar 1-on-1</Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                <h4 className="font-medium mb-3">Notificações</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="notify-collab" defaultChecked />
                    <label htmlFor="notify-collab" className="text-sm">Lembrar colaborador 7 dias antes</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="notify-manager" defaultChecked />
                    <label htmlFor="notify-manager" className="text-sm">Lembrar gestor 7 dias antes</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="notify-monthly" defaultChecked />
                    <label htmlFor="notify-monthly" className="text-sm">Enviar resumo mensal de progresso</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
