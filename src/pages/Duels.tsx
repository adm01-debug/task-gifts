import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, Swords, Trophy, Clock, Send, X, Check,
  Users, Zap, Crown, Target, Timer, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { showUndoToast } from "@/components/UndoToast";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { PageTransition } from "@/components/PageTransition";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  useUserDuels,
  useActiveDuel,
  usePotentialOpponents,
  useCreateDuel,
  useAcceptDuel,
  useDeclineDuel,
  useCancelDuel,
  duelKeys,
} from "@/hooks/useDuels";
import { DuelWithProfiles } from "@/services/duelsService";
import { formatDistanceToNow, differenceInSeconds, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DuelCardProps {
  duel: DuelWithProfiles;
  userId: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  pendingAction?: { duelId: string; type: 'accept' | 'decline' | 'cancel' } | null;
}

const DuelCard = forwardRef<HTMLDivElement, DuelCardProps>(({ 
  duel, 
  userId,
  onAccept,
  onDecline,
  onCancel,
  pendingAction,
}, ref) => {
  const isThisDuelPending = pendingAction?.duelId === duel.id;
  const isAccepting = isThisDuelPending && pendingAction?.type === 'accept';
  const isDeclining = isThisDuelPending && pendingAction?.type === 'decline';
  const isCancelling = isThisDuelPending && pendingAction?.type === 'cancel';
  const isChallenger = duel.challenger_id === userId;
  const opponent = isChallenger ? duel.opponent : duel.challenger;
  const myXpGained = isChallenger ? duel.challenger_xp_gained : duel.opponent_xp_gained;
  const opponentXpGained = isChallenger ? duel.opponent_xp_gained : duel.challenger_xp_gained;

  const getTimeRemaining = () => {
    if (!duel.ends_at) return null;
    const remaining = differenceInSeconds(new Date(duel.ends_at), new Date());
    if (remaining <= 0) return "Encerrado";
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = () => {
    switch (duel.status) {
      case 'pending': return 'bg-warning/20 text-warning border-warning/30';
      case 'accepted': return 'bg-primary/20 text-primary border-primary/30';
      case 'active': return 'bg-success/20 text-success border-success/30';
      case 'completed': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'declined': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'cancelled': return 'bg-muted text-muted-foreground border-muted';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = () => {
    switch (duel.status) {
      case 'pending': return isChallenger ? 'Aguardando' : 'Desafio Recebido';
      case 'accepted': return 'Iniciando...';
      case 'active': return 'Em Andamento';
      case 'completed': return duel.winner_id === userId ? 'Vitória!' : duel.winner_id ? 'Derrota' : 'Empate';
      case 'declined': return 'Recusado';
      case 'cancelled': return 'Cancelado';
      default: return duel.status;
    }
  };

  const isWinner = duel.status === 'completed' && duel.winner_id === userId;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative p-5 rounded-2xl border bg-card overflow-hidden
        ${isWinner ? 'border-gold/50 shadow-[0_0_30px_hsl(var(--gold)/0.2)]' : 'border-border'}
      `}
    >
      {/* Winner glow effect */}
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
            {getStatusLabel()}
          </div>
          {duel.status === 'active' && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Timer className="w-4 h-4" />
              <span>{getTimeRemaining()}</span>
            </div>
          )}
        </div>

        {/* VS Section */}
        <div className="flex items-center gap-4 mb-4">
          {/* Me */}
          <div className="flex-1 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold mb-2">
              {isChallenger 
                ? duel.challenger?.display_name?.charAt(0).toUpperCase() 
                : duel.opponent?.display_name?.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-medium truncate">Você</p>
            {duel.status === 'active' || duel.status === 'completed' ? (
              <p className="text-lg font-bold text-xp">+{myXpGained} XP</p>
            ) : null}
          </div>

          {/* VS Badge */}
          <div className="relative">
            <motion.div
              animate={duel.status === 'active' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-destructive to-warning flex items-center justify-center"
            >
              <Swords className="w-6 h-6 text-white" />
            </motion.div>
          </div>

          {/* Opponent */}
          <div className="flex-1 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-xl font-bold mb-2">
              {opponent?.display_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <p className="text-sm font-medium truncate">{opponent?.display_name || "Oponente"}</p>
            {duel.status === 'active' || duel.status === 'completed' ? (
              <p className="text-lg font-bold text-xp">+{opponentXpGained} XP</p>
            ) : (
              <p className="text-xs text-muted-foreground">Nível {opponent?.level || 1}</p>
            )}
          </div>
        </div>

        {/* XP Progress Bar (for active duels) */}
        {duel.status === 'active' && (
          <div className="mb-4">
            <div className="h-3 rounded-full bg-muted overflow-hidden flex">
              <motion.div
                initial={{ width: "50%" }}
                animate={{ 
                  width: `${myXpGained + opponentXpGained > 0 
                    ? (myXpGained / (myXpGained + opponentXpGained)) * 100 
                    : 50}%` 
                }}
                className="h-full bg-gradient-to-r from-primary to-secondary"
              />
              <motion.div
                initial={{ width: "50%" }}
                animate={{ 
                  width: `${myXpGained + opponentXpGained > 0 
                    ? (opponentXpGained / (myXpGained + opponentXpGained)) * 100 
                    : 50}%` 
                }}
                className="h-full bg-gradient-to-r from-accent to-warning"
              />
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center justify-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-xp" />
            <span className="font-semibold">{duel.xp_reward} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gold">🪙</span>
            <span className="font-semibold">{duel.coin_reward}</span>
          </div>
        </div>

        {/* Message */}
        {duel.message && (
          <p className="text-sm text-muted-foreground text-center italic mb-4">
            "{duel.message}"
          </p>
        )}

        {/* Actions */}
        {duel.status === 'pending' && !isChallenger && onAccept && onDecline && (
          <div className="flex gap-2">
            <Button 
              onClick={onAccept} 
              className="flex-1 bg-success hover:bg-success/90"
              disabled={isAccepting || isDeclining}
            >
              {isAccepting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {isAccepting ? "Aceitando..." : "Aceitar"}
            </Button>
            <Button 
              onClick={onDecline} 
              variant="outline" 
              className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
              disabled={isAccepting || isDeclining}
            >
              <X className="w-4 h-4 mr-2" />
              Recusar
            </Button>
          </div>
        )}

        {duel.status === 'pending' && isChallenger && onCancel && (
          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="w-full"
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelando..." : "Cancelar Desafio"}
          </Button>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          {formatDistanceToNow(new Date(duel.created_at), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
    </motion.div>
  );
});
DuelCard.displayName = "DuelCard";

interface CreateDuelDialogProps {
  userId: string;
  onClose: () => void;
}

const CreateDuelDialog = forwardRef<HTMLDivElement, CreateDuelDialogProps>(({ 
  userId, 
  onClose 
}, ref) => {
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState(24);

  const { data: opponents, isLoading } = usePotentialOpponents(userId);
  const createDuel = useCreateDuel();

  const handleCreate = () => {
    if (!selectedOpponent) return;
    createDuel.mutate({
      challengerId: userId,
      opponentId: selectedOpponent,
      durationHours: duration,
      message: message || undefined,
    }, {
      onSuccess: onClose,
    });
  };

  return (
    <div className="space-y-6">
      {/* Duration Selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">Duração do Duelo</label>
        <div className="grid grid-cols-3 gap-2">
          {[12, 24, 48].map(hours => (
            <Button
              key={hours}
              variant={duration === hours ? "default" : "outline"}
              onClick={() => setDuration(hours)}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {hours}h
            </Button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="text-sm font-medium mb-2 block">Mensagem (opcional)</label>
        <Input
          placeholder="Prepare-se para perder! 😈"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={100}
        />
      </div>

      {/* Opponent Selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">Escolha seu Oponente</label>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Carregando...</div>
          ) : opponents?.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">Nenhum oponente disponível</div>
          ) : (
            opponents?.map(opp => (
              <motion.button
                key={opp.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedOpponent(opp.id)}
                className={`
                  w-full p-3 rounded-xl border flex items-center gap-3 text-left transition-all
                  ${selectedOpponent === opp.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card hover:border-primary/50'}
                `}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-sm font-bold">
                  {opp.display_name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{opp.display_name || "Jogador"}</p>
                  <p className="text-xs text-muted-foreground">
                    Nível {opp.level} • {opp.xp.toLocaleString()} XP
                  </p>
                </div>
                {selectedOpponent === opp.id && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </motion.button>
            ))
          )}
        </div>
      </div>

      <Button 
        onClick={handleCreate} 
        disabled={!selectedOpponent || createDuel.isPending}
        className="w-full"
      >
        <Swords className="w-4 h-4 mr-2" />
        {createDuel.isPending ? "Enviando..." : "Enviar Desafio"}
      </Button>
    </div>
  );
});
CreateDuelDialog.displayName = "CreateDuelDialog";

const Duels = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "decline" | "cancel" | null;
    duelId: string | null;
    opponentName: string;
  }>({ open: false, type: null, duelId: null, opponentName: "" });
  const [pendingAction, setPendingAction] = useState<{
    duelId: string;
    type: 'accept' | 'decline' | 'cancel';
  } | null>(null);

  const { data: duels, isLoading: loadingDuels } = useUserDuels(user?.id);
  const { data: activeDuel } = useActiveDuel(user?.id);
  
  const acceptDuel = useAcceptDuel();
  const declineDuel = useDeclineDuel();
  const cancelDuel = useCancelDuel();

  const handleDeclineClick = (duelId: string, opponentName: string) => {
    setConfirmDialog({ open: true, type: "decline", duelId, opponentName });
  };

  const handleCancelClick = (duelId: string, opponentName: string) => {
    setConfirmDialog({ open: true, type: "cancel", duelId, opponentName });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.duelId || !user) return;
    
    const duelIdToRestore = confirmDialog.duelId;
    const opponentNameToRestore = confirmDialog.opponentName;
    
    if (confirmDialog.type === "decline") {
      setPendingAction({ duelId: duelIdToRestore, type: 'decline' });
      declineDuel.mutate({ duelId: confirmDialog.duelId, userId: user.id }, {
        onSuccess: () => {
          showUndoToast({
            message: `Duelo com ${opponentNameToRestore} recusado`,
            onUndo: async () => {
              await supabase
                .from("direct_duels")
                .update({ status: "pending" })
                .eq("id", duelIdToRestore);
              queryClient.invalidateQueries({ queryKey: duelKeys.all });
            },
          });
        },
        onSettled: () => setPendingAction(null),
      });
    } else if (confirmDialog.type === "cancel") {
      setPendingAction({ duelId: duelIdToRestore, type: 'cancel' });
      cancelDuel.mutate({ duelId: confirmDialog.duelId, userId: user.id }, {
        onSuccess: () => {
          showUndoToast({
            message: `Duelo com ${opponentNameToRestore} cancelado`,
            onUndo: async () => {
              await supabase
                .from("direct_duels")
                .update({ status: "pending" })
                .eq("id", duelIdToRestore);
              queryClient.invalidateQueries({ queryKey: duelKeys.all });
            },
          });
        },
        onSettled: () => setPendingAction(null),
      });
    }
    setConfirmDialog({ open: false, type: null, duelId: null, opponentName: "" });
  };

  // FAB actions
  const fabActions = [
    {
      icon: Swords,
      label: "Novo Duelo",
      onClick: () => setDialogOpen(true),
      color: "primary" as const,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    );
  }

  const activeDuels = duels?.filter(d => ['pending', 'accepted', 'active'].includes(d.status)) || [];
  const completedDuels = duels?.filter(d => ['completed', 'declined', 'cancelled'].includes(d.status)) || [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
          title={confirmDialog.type === "decline" ? "Recusar Duelo?" : "Cancelar Duelo?"}
          description={
            confirmDialog.type === "decline"
              ? `Tem certeza que deseja recusar o desafio de ${confirmDialog.opponentName}? Esta ação pode ser desfeita.`
              : `Tem certeza que deseja cancelar o duelo com ${confirmDialog.opponentName}?`
          }
          confirmText={confirmDialog.type === "decline" ? "Recusar" : "Cancelar Duelo"}
          variant={confirmDialog.type === "decline" ? "warning" : "danger"}
          onConfirm={handleConfirmAction}
        />

        {/* Floating Action Button */}
        <FloatingActionButton actions={fabActions} />

        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Swords className="w-5 h-5 text-destructive" />
              Duelos Diretos
            </h1>
            <p className="text-sm text-muted-foreground">Desafie colegas para competições 1v1</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Target className="w-4 h-4" />
                Novo Duelo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Swords className="w-5 h-5 text-destructive" />
                  Criar Desafio
                </DialogTitle>
              </DialogHeader>
              {user && <CreateDuelDialog userId={user.id} onClose={() => setDialogOpen(false)} />}
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Active Duels */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-success" />
            Duelos Ativos
            {activeDuels.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({activeDuels.length})
              </span>
            )}
          </h2>

          {loadingDuels ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : activeDuels.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <Swords className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum duelo ativo</p>
              <Button onClick={() => setDialogOpen(true)}>
                Criar Primeiro Duelo
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeDuels.map(duel => {
                const isChallenger = duel.challenger_id === user!.id;
                const opponentName = isChallenger 
                  ? (duel.opponent?.display_name || "Oponente")
                  : (duel.challenger?.display_name || "Desafiante");
                
                return (
                  <DuelCard
                    key={duel.id}
                    duel={duel}
                    userId={user!.id}
                    onAccept={() => {
                      setPendingAction({ duelId: duel.id, type: 'accept' });
                      acceptDuel.mutate({ duelId: duel.id, userId: user!.id }, {
                        onSettled: () => setPendingAction(null),
                      });
                    }}
                    onDecline={() => handleDeclineClick(duel.id, opponentName)}
                    onCancel={() => handleCancelClick(duel.id, opponentName)}
                    pendingAction={pendingAction}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* History */}
        {completedDuels.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
              Histórico
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {completedDuels.slice(0, 6).map(duel => (
                <DuelCard
                  key={duel.id}
                  duel={duel}
                  userId={user!.id}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      </div>
    </PageTransition>
  );
};

export default Duels;
