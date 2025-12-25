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
import { useOKRs, useKeyResults } from "@/hooks/useOKRs";
import { Target, TrendingUp, AlertCircle, CheckCircle2, Plus, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'on_track': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'at_risk': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'behind': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="h-4 w-4" />;
    case 'on_track': return <TrendingUp className="h-4 w-4" />;
    case 'at_risk': return <AlertCircle className="h-4 w-4" />;
    case 'behind': return <AlertCircle className="h-4 w-4" />;
    default: return <Target className="h-4 w-4" />;
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 70) return 'bg-green-500';
  if (progress >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

interface KeyResultsListProps {
  objectiveId: string;
}

const KeyResultsList = ({ objectiveId }: KeyResultsListProps) => {
  const { keyResults, isLoading, updateProgress } = useKeyResults(objectiveId);

  if (isLoading) return <Spinner className="h-4 w-4" />;

  return (
    <div className="space-y-3 mt-4">
      {keyResults.map((kr) => {
        const progress = ((kr.current_value - kr.start_value) / (kr.target_value - kr.start_value)) * 100;
        
        return (
          <div key={kr.id} className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{kr.title}</span>
              <Badge variant="outline" className={getStatusColor(kr.status)}>
                {getStatusIcon(kr.status)}
                <span className="ml-1 capitalize">{kr.status.replace('_', ' ')}</span>
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Progress 
                value={Math.min(100, Math.max(0, progress))} 
                className="flex-1 h-2"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {kr.current_value} / {kr.target_value} {kr.unit || ''}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const OKRDashboard = () => {
  const { objectives, cycles, isLoading, createObjective } = useOKRs();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newObjective, setNewObjective] = useState<{
    title: string;
    description: string;
    visibility: 'public' | 'department' | 'private';
  }>({
    title: '',
    description: '',
    visibility: 'public',
  });

  const handleCreateObjective = () => {
    createObjective({
      title: newObjective.title,
      description: newObjective.description,
      owner_id: 'current-user',
      period_start: '2025-01-01',
      period_end: '2025-03-31',
      status: 'draft',
      weight: 1,
      visibility: newObjective.visibility,
    });
    setIsDialogOpen(false);
    setNewObjective({ title: '', description: '', visibility: 'public' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const avgProgress = objectives.length > 0
    ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length)
    : 0;

  const activeObjectives = objectives.filter(o => o.status === 'active');
  const completedObjectives = objectives.filter(o => o.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progresso Geral</p>
                <p className="text-3xl font-bold">{avgProgress}%</p>
              </div>
              <Target className="h-10 w-10 text-primary opacity-80" />
            </div>
            <Progress value={avgProgress} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Objetivos Ativos</p>
                <p className="text-3xl font-bold">{activeObjectives.length}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-3xl font-bold">{completedObjectives.length}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ciclo Atual</p>
                <p className="text-xl font-bold">{cycles[0]?.name || 'N/A'}</p>
              </div>
              <Badge variant="outline" className="bg-green-500/20 text-green-400">
                Ativo
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OKRs List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Meus Objetivos (OKRs)
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Objetivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Objetivo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título do Objetivo</Label>
                  <Input 
                    value={newObjective.title}
                    onChange={(e) => setNewObjective(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Aumentar satisfação do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea 
                    value={newObjective.description}
                    onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o objetivo..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visibilidade</Label>
                  <Select 
                    value={newObjective.visibility}
                    onValueChange={(value: 'public' | 'department' | 'private') => 
                      setNewObjective(prev => ({ ...prev, visibility: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Toda empresa</SelectItem>
                      <SelectItem value="department">Meu departamento</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateObjective} className="w-full">
                  Criar Objetivo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Ativos ({activeObjectives.length})</TabsTrigger>
              <TabsTrigger value="all">Todos ({objectives.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4 space-y-4">
              {activeObjectives.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum objetivo ativo</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setIsDialogOpen(true)}>
                    Criar primeiro objetivo
                  </Button>
                </div>
              ) : (
                activeObjectives.map((objective) => (
                  <Card key={objective.id} className="bg-muted/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            {objective.title}
                            <Badge variant="outline" className={getStatusColor(objective.status)}>
                              {objective.status}
                            </Badge>
                          </h3>
                          {objective.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {objective.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold">{objective.progress}%</span>
                        </div>
                      </div>
                      
                      <Progress 
                        value={objective.progress} 
                        className="h-3"
                      />
                      
                      <KeyResultsList objectiveId={objective.id} />
                      
                      <div className="flex justify-end mt-4">
                        <Button variant="ghost" size="sm">
                          Ver detalhes <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-4 space-y-4">
              {objectives.map((objective) => (
                <Card key={objective.id} className="bg-muted/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{objective.title}</h3>
                        <Badge variant="outline" className={getStatusColor(objective.status)}>
                          {objective.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={objective.progress} className="w-24 h-2" />
                        <span className="text-sm font-medium">{objective.progress}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
