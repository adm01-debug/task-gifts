import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, TrendingUp, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
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
import { useGoals } from "@/hooks/useGoals";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import type { Goal, KeyResult } from "@/types/goals";
import { PageWrapper } from "@/components/PageWrapper";
import { SEOHead } from "@/components/SEOHead";
import { useSEO } from "@/hooks/useSEO";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobilePageLayout } from "@/components/mobile";
export default function Goals() {
  const seoConfig = useSEO();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { goals, teamGoals, companyGoals, isLoading, createGoal, updateGoal, createKeyResult, deleteGoal, isCreating } = useGoals();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    goal_type: "personal",
    priority: "medium",
    due_date: "",
  });
  const [newKeyResult, setNewKeyResult] = useState({
    title: "",
    target_value: 100,
    metric_type: "percentage" as "percentage" | "number" | "currency" | "boolean",
    unit: "%",
  });

  const handleCreateGoal = () => {
    if (!newGoal.title.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }
    createGoal({
      title: newGoal.title,
      description: newGoal.description || undefined,
      goal_type: newGoal.goal_type as "personal" | "team" | "company",
      priority: newGoal.priority as "low" | "medium" | "high",
      due_date: newGoal.due_date || undefined,
    });
    setNewGoal({ title: "", description: "", goal_type: "personal", priority: "medium", due_date: "" });
    setIsDialogOpen(false);
  };

  const handleAddKeyResult = (goalId: string) => {
    if (!newKeyResult.title.trim()) return;
    createKeyResult({
      goal_id: goalId,
      title: newKeyResult.title,
      target_value: newKeyResult.target_value,
      metric_type: newKeyResult.metric_type,
      unit: newKeyResult.unit,
    });
    setNewKeyResult({ title: "", target_value: 100, metric_type: "percentage", unit: "%" });
    setSelectedGoal(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "at_risk": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string): "destructive" | "default" | "secondary" => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      default: return "secondary";
    }
  };

  const GoalCard = ({ goal }: { goal: Goal }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(goal.status)}
              <CardTitle className="text-lg">{goal.title}</CardTitle>
            </div>
            <Badge variant={getPriorityColor(goal.priority)}>
              {goal.priority === "high" ? "Alta" : goal.priority === "medium" ? "Média" : "Baixa"}
            </Badge>
          </div>
          {goal.description && (
            <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso</span>
                <span className="font-medium">{goal.progress_percent}%</span>
              </div>
              <Progress value={goal.progress_percent} className="h-2" />
            </div>

            {goal.due_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Prazo: {format(new Date(goal.due_date), "dd MMM yyyy", { locale: ptBR })}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                {goal.xp_reward} XP + {goal.coin_reward} moedas
              </span>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Key Results</span>
                <Dialog open={selectedGoal === goal.id} onOpenChange={(open) => setSelectedGoal(open ? goal.id : null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Key Result</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Título</Label>
                        <Input
                          value={newKeyResult.title}
                          onChange={(e) => setNewKeyResult({ ...newKeyResult, title: e.target.value })}
                          placeholder="Ex: Aumentar vendas em 20%"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Meta</Label>
                          <Input
                            type="number"
                            value={newKeyResult.target_value}
                            onChange={(e) => setNewKeyResult({ ...newKeyResult, target_value: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Unidade</Label>
                          <Input
                            value={newKeyResult.unit}
                            onChange={(e) => setNewKeyResult({ ...newKeyResult, unit: e.target.value })}
                            placeholder="%"
                          />
                        </div>
                      </div>
                      <Button onClick={() => handleAddKeyResult(goal.id)} className="w-full">
                        Criar Key Result
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {goal.key_results?.length > 0 ? (
                <div className="space-y-2">
                  {goal.key_results.map((kr: KeyResult) => (
                    <div key={kr.id} className="flex items-center gap-2 text-sm">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="truncate">{kr.title}</span>
                          <span className="text-muted-foreground">
                            {kr.current_value}/{kr.target_value} {kr.unit}
                          </span>
                        </div>
                        <Progress 
                          value={(kr.current_value / kr.target_value) * 100} 
                          className="h-1 mt-1" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum key result definido</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {goal.status !== "completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => updateGoal({ goalId: goal.id, updates: { status: "completed", progress_percent: 100 } })}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Concluir
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => deleteGoal(goal.id)}
              >
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const pageContent = (
    <>
      <SEOHead title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} />
      <main className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-24">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Goals</p>
                  <p className="text-2xl font-bold">{goals.length}</p>
                </div>
                <Target className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {goals.filter((g) => g.status === "completed").length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Progresso</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {goals.filter((g) => g.status === "active").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">XP Potencial</p>
                  <p className="text-2xl font-bold text-primary">
                    {goals.reduce((acc, g) => acc + g.xp_reward, 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="Ex: Aumentar produtividade do time"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Descreva o objetivo..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={newGoal.goal_type} onValueChange={(v) => setNewGoal({ ...newGoal, goal_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Pessoal</SelectItem>
                        <SelectItem value="team">Time</SelectItem>
                        <SelectItem value="company">Empresa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prioridade</Label>
                    <Select value={newGoal.priority} onValueChange={(v) => setNewGoal({ ...newGoal, priority: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Data Limite</Label>
                  <Input
                    type="date"
                    value={newGoal.due_date}
                    onChange={(e) => setNewGoal({ ...newGoal, due_date: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateGoal} className="w-full" disabled={isCreating}>
                  {isCreating ? "Criando..." : "Criar Goal"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal">Meus Goals ({goals.length})</TabsTrigger>
            <TabsTrigger value="team">Time ({teamGoals.length})</TabsTrigger>
            <TabsTrigger value="company">Empresa ({companyGoals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : goals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">Nenhum goal pessoal</h3>
                  <p className="text-muted-foreground mb-4">Crie seu primeiro objetivo para começar!</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="team">
            {teamGoals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium">Nenhum goal de time</h3>
                  <p className="text-muted-foreground">Goals do time aparecerão aqui</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="company">
            {companyGoals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium">Nenhum goal da empresa</h3>
                  <p className="text-muted-foreground">Goals estratégicos aparecerão aqui</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );

  // Mobile: use MobilePageLayout for consistent navigation
  if (isMobile) {
    return (
      <MobilePageLayout
        title="Goals & OKRs"
        icon={Target}
        backPath="/"
      >
        {pageContent}
      </MobilePageLayout>
    );
  }

  // Desktop: original layout with header
  return (
    <PageWrapper pageName="Goals" className="min-h-screen bg-background">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Target className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Goals & OKRs</h1>
        <span className="text-muted-foreground ml-2">Gerencie seus objetivos</span>
      </header>
      {pageContent}
    </PageWrapper>
  );
}
