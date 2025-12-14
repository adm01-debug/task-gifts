import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MoreHorizontal,
  Edit3,
  Archive,
  BarChart2,
  Users,
  Clock,
  Sparkles,
  Coins,
  Target,
  Plus,
  Eye,
  Trash2,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  xp_reward: number;
  coin_reward: number;
  status: "draft" | "active" | "archived";
  deadline_days: number | null;
  max_participants: number | null;
  tags: string[] | null;
  created_at: string;
  quest_steps: { id: string }[];
  quest_assignments: { id: string; completed_at: string | null }[];
}

const difficultyConfig = {
  easy: { label: "Fácil", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  medium: { label: "Médio", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  hard: { label: "Difícil", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  expert: { label: "Expert", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const statusConfig = {
  draft: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  active: { label: "Ativa", color: "bg-green-500/20 text-green-400" },
  archived: { label: "Arquivada", color: "bg-gray-500/20 text-gray-400" },
};

interface QuestStatsModalProps {
  quest: Quest | null;
  open: boolean;
  onClose: () => void;
}

const QuestStatsModal = ({ quest, open, onClose }: QuestStatsModalProps) => {
  if (!quest) return null;

  const totalAssignments = quest.quest_assignments?.length || 0;
  const completedAssignments = quest.quest_assignments?.filter(a => a.completed_at)?.length || 0;
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
  const stepsCount = quest.quest_steps?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-3xl">{quest.icon}</span>
            {quest.title}
          </DialogTitle>
          <DialogDescription>{quest.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-primary/10 border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">{totalAssignments}</span>
              </div>
              <p className="text-sm text-muted-foreground">Participantes</p>
            </Card>

            <Card className="p-4 bg-green-500/10 border-green-500/20">
              <div className="flex items-center gap-2 text-green-400">
                <Target className="h-5 w-5" />
                <span className="text-2xl font-bold">{completedAssignments}</span>
              </div>
              <p className="text-sm text-muted-foreground">Concluíram</p>
            </Card>
          </div>

          {/* Completion rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Taxa de Conclusão</span>
              <span className="text-sm font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{quest.xp_reward} XP</p>
                <p className="text-xs text-muted-foreground">Recompensa</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Coins className="h-4 w-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{quest.coin_reward} coins</p>
                <p className="text-xs text-muted-foreground">Recompensa</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{stepsCount} etapas</p>
                <p className="text-xs text-muted-foreground">Na trilha</p>
              </div>
            </div>

            {quest.deadline_days && (
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Clock className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{quest.deadline_days} dias</p>
                  <p className="text-xs text-muted-foreground">Prazo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const QuestCard = ({ 
  quest, 
  index,
  onViewStats,
  onArchive,
  onActivate,
  onDelete,
}: { 
  quest: Quest; 
  index: number;
  onViewStats: (quest: Quest) => void;
  onArchive: (quest: Quest) => void;
  onActivate: (quest: Quest) => void;
  onDelete: (quest: Quest) => void;
}) => {
  const navigate = useNavigate();
  const diffConfig = difficultyConfig[quest.difficulty];
  const statConfig = statusConfig[quest.status];
  const totalAssignments = quest.quest_assignments?.length || 0;
  const completedAssignments = quest.quest_assignments?.filter(a => a.completed_at)?.length || 0;
  const stepsCount = quest.quest_steps?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg">
        {/* Status indicator bar */}
        <div className={`absolute inset-x-0 top-0 h-1 ${
          quest.status === "active" ? "bg-green-500" :
          quest.status === "draft" ? "bg-yellow-500" : "bg-gray-500"
        }`} />

        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-2xl shadow-sm"
            >
              {quest.icon}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-foreground line-clamp-1">{quest.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">{quest.description}</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewStats(quest)}>
                      <BarChart2 className="mr-2 h-4 w-4" />
                      Ver Estatísticas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/quest-builder?edit=${quest.id}`)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Editar Quest
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {quest.status === "active" ? (
                      <DropdownMenuItem onClick={() => onArchive(quest)}>
                        <Pause className="mr-2 h-4 w-4" />
                        Pausar / Arquivar
                      </DropdownMenuItem>
                    ) : quest.status === "draft" || quest.status === "archived" ? (
                      <DropdownMenuItem onClick={() => onActivate(quest)}>
                        <Play className="mr-2 h-4 w-4" />
                        Ativar Quest
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(quest)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Quest
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Badges */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={statConfig.color}>
                  {statConfig.label}
                </Badge>
                <Badge variant="outline" className={diffConfig.color}>
                  {diffConfig.label}
                </Badge>
                <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400">
                  <Sparkles className="mr-1 h-3 w-3" />
                  {quest.xp_reward} XP
                </Badge>
              </div>

              {/* Stats row */}
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{stepsCount} etapas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{totalAssignments} participantes</span>
                </div>
                {completedAssignments > 0 && (
                  <div className="flex items-center gap-1 text-green-400">
                    <Eye className="h-4 w-4" />
                    <span>{completedAssignments} concluídos</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export function QuestsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statsQuest, setStatsQuest] = useState<Quest | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");

  const { data: quests, isLoading } = useQuery({
    queryKey: ["manager-quests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("custom_quests")
        .select(`
          *,
          quest_steps(id),
          quest_assignments(id, completed_at)
        `)
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Quest[];
    },
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ questId, status }: { questId: string; status: "active" | "archived" }) => {
      const { error } = await supabase
        .from("custom_quests")
        .update({ status })
        .eq("id", questId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-quests"] });
      toast({ title: "Status atualizado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (questId: string) => {
      const { error } = await supabase
        .from("custom_quests")
        .delete()
        .eq("id", questId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-quests"] });
      toast({ title: "Quest excluída!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  // Memoized filtered quests
  const filteredQuests = useMemo(() => 
    quests?.filter(q => statusFilter === "all" || q.status === statusFilter) || [],
    [quests, statusFilter]
  );

  const activeCount = useMemo(() => quests?.filter(q => q.status === "active").length || 0, [quests]);
  const draftCount = useMemo(() => quests?.filter(q => q.status === "draft").length || 0, [quests]);

  // Memoized handlers
  const handleNavigateToQuestBuilder = useCallback(() => navigate("/quest-builder"), [navigate]);
  const handleStatusFilterChange = useCallback((status: "all" | "active" | "draft" | "archived") => setStatusFilter(status), []);
  const handleCloseStatsModal = useCallback(() => setStatsQuest(null), []);
  const handleArchive = useCallback((q: Quest) => updateStatusMutation.mutate({ questId: q.id, status: "archived" }), [updateStatusMutation]);
  const handleActivate = useCallback((q: Quest) => updateStatusMutation.mutate({ questId: q.id, status: "active" }), [updateStatusMutation]);
  const handleDelete = useCallback((q: Quest) => {
    if (confirm("Tem certeza que deseja excluir esta quest?")) {
      deleteMutation.mutate(q.id);
    }
  }, [deleteMutation]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Quests Criadas</h2>
          <p className="text-sm text-muted-foreground">
            {activeCount} ativas, {draftCount} rascunhos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["all", "active", "draft", "archived"] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent hover:bg-muted text-muted-foreground"
                }`}
              >
                {status === "all" ? "Todas" : 
                 status === "active" ? "Ativas" :
                 status === "draft" ? "Rascunhos" : "Arquivadas"}
              </button>
            ))}
          </div>

          <Button onClick={handleNavigateToQuestBuilder} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Quest
          </Button>
        </div>
      </div>

      {/* Quests grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : filteredQuests.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Nenhuma quest encontrada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {statusFilter === "all" 
              ? "Crie sua primeira trilha de aprendizado"
              : `Nenhuma quest ${statusFilter === "active" ? "ativa" : statusFilter === "draft" ? "em rascunho" : "arquivada"}`
            }
          </p>
          <Button onClick={handleNavigateToQuestBuilder} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Criar Quest
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredQuests.map((quest, index) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                index={index}
                onViewStats={setStatsQuest}
                onArchive={handleArchive}
                onActivate={handleActivate}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stats modal */}
      <QuestStatsModal
        quest={statsQuest}
        open={!!statsQuest}
        onClose={handleCloseStatsModal}
      />
    </div>
  );
}
