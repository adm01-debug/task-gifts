import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RotateCcw, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Coins,
  ListTodo,
  Target,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMyTaskScores, useTaskPenalties, useCompleteTaskScore } from "@/hooks/usePositions";
import { useAuth } from "@/hooks/useAuth";
import { format, formatDistanceToNow, isPast, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TaskScore } from "@/services/positionsService";

export const TaskScoresDashboard = () => {
  const { user } = useAuth();
  const { data: tasks = [], isLoading } = useMyTaskScores();
  const { data: penalties = [] } = useTaskPenalties(user?.id);
  const completeTask = useCompleteTaskScore();
  const [activeTab, setActiveTab] = useState("pending");

  // Estatísticas
  const stats = {
    pending: tasks.filter(t => t.status === "pending").length,
    completed: tasks.filter(t => t.status === "on_time").length,
    late: tasks.filter(t => t.status === "late").length,
    rework: tasks.filter(t => t.status === "rework").length,
    totalXpEarned: tasks.reduce((sum, t) => sum + (t.xp_earned || 0), 0),
    totalXpLost: tasks.reduce((sum, t) => sum + (t.xp_penalty || 0), 0),
    totalCoins: tasks.reduce((sum, t) => sum + (t.coins_earned || 0), 0),
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.status === "on_time").length / tasks.length) * 100) 
      : 0
  };

  const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
    pending: { 
      icon: <Clock className="h-4 w-4" />, 
      label: "Pendente", 
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20"
    },
    on_time: { 
      icon: <CheckCircle2 className="h-4 w-4" />, 
      label: "No Prazo", 
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    },
    late: { 
      icon: <AlertTriangle className="h-4 w-4" />, 
      label: "Atrasada", 
      color: "text-orange-400",
      bgColor: "bg-orange-500/20"
    },
    rework: { 
      icon: <RotateCcw className="h-4 w-4" />, 
      label: "Retrabalho", 
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    },
    rejected: { 
      icon: <XCircle className="h-4 w-4" />, 
      label: "Rejeitada", 
      color: "text-red-400",
      bgColor: "bg-red-500/20"
    }
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case "pending":
        return tasks.filter(t => t.status === "pending");
      case "completed":
        return tasks.filter(t => t.status === "on_time" || t.status === "late");
      case "issues":
        return tasks.filter(t => t.status === "rework" || t.status === "rejected");
      default:
        return tasks;
    }
  };

  const getDeadlineStatus = (task: TaskScore) => {
    if (!task.deadline_at) return null;
    const deadline = new Date(task.deadline_at);
    const hoursLeft = differenceInHours(deadline, new Date());
    
    if (isPast(deadline)) {
      return { label: "Atrasada", color: "text-red-400", urgent: true };
    } else if (hoursLeft <= 4) {
      return { label: `${hoursLeft}h restantes`, color: "text-orange-400", urgent: true };
    } else if (hoursLeft <= 24) {
      return { label: `${hoursLeft}h restantes`, color: "text-yellow-400", urgent: false };
    }
    return { label: formatDistanceToNow(deadline, { locale: ptBR, addSuffix: true }), color: "text-muted-foreground", urgent: false };
  };

  const handleCompleteTask = async (taskId: string, isLate: boolean) => {
    await completeTask.mutateAsync({
      taskScoreId: taskId,
      status: isLate ? "late" : "on_time"
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Progress value={stats.completionRate} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">XP Ganho</p>
                  <p className="text-2xl font-bold text-green-400">+{stats.totalXpEarned}</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">XP Perdido</p>
                  <p className="text-2xl font-bold text-red-400">-{stats.totalXpLost}</p>
                </div>
                <div className="p-3 rounded-full bg-red-500/10">
                  <TrendingDown className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Moedas</p>
                  <p className="text-2xl font-bold text-yellow-400">+{stats.totalCoins}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <Coins className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ListTodo className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Minhas Tarefas</CardTitle>
              <CardDescription>
                Acompanhe suas tarefas e pontuação em tempo real
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pendentes ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Concluídas ({stats.completed + stats.late})
              </TabsTrigger>
              <TabsTrigger value="issues" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Problemas ({stats.rework})
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <ListTodo className="h-4 w-4" />
                Todas ({tasks.length})
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {getFilteredTasks().map((task, index) => {
                    const config = statusConfig[task.status];
                    const deadlineStatus = getDeadlineStatus(task);
                    
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border ${
                          deadlineStatus?.urgent ? "border-destructive/50 bg-destructive/5" : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${config.bgColor} ${config.color}`} variant="outline">
                                {config.icon}
                                <span className="ml-1">{config.label}</span>
                              </Badge>
                              {task.source === "bitrix24" && (
                                <Badge variant="secondary">Bitrix24</Badge>
                              )}
                              {task.rework_count > 0 && (
                                <Badge variant="destructive">
                                  {task.rework_count}x Retrabalho
                                </Badge>
                              )}
                            </div>
                            
                            <h4 className="font-medium">{task.title}</h4>
                            
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              {deadlineStatus && (
                                <span className={`flex items-center gap-1 ${deadlineStatus.color}`}>
                                  <Calendar className="h-3 w-3" />
                                  {deadlineStatus.label}
                                </span>
                              )}
                              
                              {task.status !== "pending" && (
                                <>
                                  {task.xp_earned > 0 && (
                                    <span className="text-green-400 flex items-center gap-1">
                                      <Zap className="h-3 w-3" />
                                      +{task.xp_earned} XP
                                    </span>
                                  )}
                                  {task.xp_penalty > 0 && (
                                    <span className="text-red-400 flex items-center gap-1">
                                      <TrendingDown className="h-3 w-3" />
                                      -{task.xp_penalty} XP
                                    </span>
                                  )}
                                  {task.coins_earned > 0 && (
                                    <span className="text-yellow-400 flex items-center gap-1">
                                      <Coins className="h-3 w-3" />
                                      +{task.coins_earned}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {task.status === "pending" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleCompleteTask(
                                task.id, 
                                task.deadline_at ? isPast(new Date(task.deadline_at)) : false
                              )}
                              disabled={completeTask.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Concluir
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {getFilteredTasks().length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma tarefa encontrada</p>
                    </div>
                  )}
                </div>
              </AnimatePresence>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Penalties */}
      {penalties.length > 0 && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Penalidades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {penalties.slice(0, 5).map((penalty) => (
                <div key={penalty.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div>
                    <p className="text-sm font-medium">{penalty.reason || "Penalidade aplicada"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(penalty.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant="destructive">-{penalty.xp_deducted} XP</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
