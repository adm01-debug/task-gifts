import { motion } from "framer-motion";
import { Zap, TrendingUp, Target, Trophy, Heart, Flame, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentAuditLogs } from "@/hooks/useAudit";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const activityConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  xp_gained: { icon: Zap, color: "success", label: "Ganhou XP" },
  level_up: { icon: TrendingUp, color: "primary", label: "Subiu de nível" },
  quest_completed: { icon: Target, color: "secondary", label: "Completou quest" },
  achievement_unlocked: { icon: Trophy, color: "warning", label: "Desbloqueou conquista" },
  kudos_received: { icon: Heart, color: "accent", label: "Recebeu kudos" },
  kudos_given: { icon: Heart, color: "primary", label: "Enviou kudos" },
  streak_updated: { icon: Flame, color: "primary", label: "Streak atualizado" },
  coins_earned: { icon: Star, color: "warning", label: "Ganhou moedas" },
  coins_spent: { icon: Star, color: "muted", label: "Gastou moedas" },
};

const colorClasses: Record<string, string> = {
  success: "bg-success/20 text-success",
  primary: "bg-primary/20 text-primary",
  secondary: "bg-secondary/20 text-secondary",
  warning: "bg-warning/20 text-warning",
  accent: "bg-accent/20 text-accent",
  muted: "bg-muted text-muted-foreground",
};

export function ProfileActivityTimeline({ userId }: { userId?: string }) {
  const { data: auditLogs = [], isLoading } = useRecentAuditLogs(10);
  const userLogs = auditLogs.filter(log => log.user_id === userId);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-secondary" />Atividade Recente
        </h3>
        <div className="space-y-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      </div>
    );
  }

  if (userLogs.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-secondary" />Atividade Recente</h3>
        <p className="text-center text-muted-foreground py-4">Nenhuma atividade registrada ainda. Complete quests, ganhe XP e desbloqueie conquistas!</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl border border-border p-6">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-secondary" />Atividade Recente</h3>
      <div className="space-y-4">
        {userLogs.slice(0, 5).map((log, i) => {
          const config = activityConfig[log.action] || { icon: Target, color: "muted", label: log.action.replace(/_/g, ' ') };
          const Icon = config.icon;
          const metadata = log.metadata as { xp_amount?: number } | null;
          const newData = log.new_data as { xp_amount?: number } | null;
          const xpAmount = metadata?.xp_amount || newData?.xp_amount || 0;
          let activityText = config.label;
          if (log.entity_type && log.entity_type !== 'profile') activityText += ` (${log.entity_type})`;

          return (
            <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[config.color] || colorClasses.muted}`}><Icon className="w-5 h-5" /></div>
              <div className="flex-1"><p className="font-medium text-sm">{activityText}</p><p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}</p></div>
              {xpAmount > 0 && <span className="text-sm font-semibold text-xp">+{xpAmount} XP</span>}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
