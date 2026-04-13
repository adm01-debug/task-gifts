import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format, subDays, startOfDay, endOfDay, eachHourOfInterval, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  Users,
  Zap,
  Clock,
  TrendingUp,
  RefreshCw,
  Radio,
} from "lucide-react";
import { AnalyticsChartTabs } from "@/components/analytics/AnalyticsChartTabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageWrapper } from "@/components/PageWrapper";
import { SEOHead } from "@/components/SEOHead";
import { useSEO } from "@/hooks/useSEO";
import { useRecentAuditLogs, AuditAction } from "@/hooks/useAudit";
import { useProfiles } from "@/hooks/useProfiles";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { DesktopBackButton } from "@/components/navigation";
const actionCategories: Record<string, AuditAction[]> = {
  auth: ["user_signup", "user_login"],
  quests: ["quest_created", "quest_updated", "quest_deleted", "quest_assigned", "quest_completed"],
  kudos: ["kudos_given", "kudos_received"],
  progression: ["xp_gained", "level_up", "coins_earned", "coins_spent", "streak_updated"],
  achievements: ["achievement_unlocked"],
  team: ["department_created", "department_updated", "team_member_added", "team_member_removed"],
  roles: ["role_assigned", "role_removed"],
};

const categoryColors: Record<string, string> = {
  auth: "#6366f1",
  quests: "#10b981",
  kudos: "#f59e0b",
  progression: "#8b5cf6",
  achievements: "#ec4899",
  team: "#06b6d4",
  roles: "#f97316",
};

const categoryLabels: Record<string, string> = {
  auth: "Autenticação",
  quests: "Quests",
  kudos: "Kudos",
  progression: "Progressão",
  achievements: "Conquistas",
  team: "Equipes",
  roles: "Cargos",
};

// CustomTooltip moved to AnalyticsChartTabs

export default function RealTimeAnalytics() {
  const navigate = useNavigate();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  const { data: auditLogs = [], refetch } = useRecentAuditLogs(1000);
  const { data: profiles = [] } = useProfiles();

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isLive) return;

    const channel = supabase
      .channel("audit-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_logs",
        },
        () => {
          refetch();
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLive, refetch]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      refetch();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [isLive, refetch]);

  // Process data for hourly chart (last 24 hours)
  const hourlyData = useMemo(() => {
    const now = new Date();
    const yesterday = subDays(now, 1);
    const hours = eachHourOfInterval({ start: yesterday, end: now });

    return hours.map((hour) => {
      const hourStart = hour;
      const hourEnd = new Date(hour.getTime() + 60 * 60 * 1000);

      const logsInHour = auditLogs.filter((log) => {
        const logDate = new Date(log.created_at);
        return logDate >= hourStart && logDate < hourEnd;
      });

      const categoryCounts: Record<string, number> = {};
      Object.keys(actionCategories).forEach((cat) => {
        categoryCounts[cat] = logsInHour.filter((log) =>
          actionCategories[cat].includes(log.action)
        ).length;
      });

      return {
        time: format(hour, "HH:mm"),
        hour: format(hour, "HH'h'"),
        total: logsInHour.length,
        ...categoryCounts,
      };
    });
  }, [auditLogs]);

  // Process data for daily chart (last 7 days)
  const dailyData = useMemo(() => {
    const now = new Date();
    const weekAgo = subDays(now, 6);
    const days = eachDayOfInterval({ start: weekAgo, end: now });

    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      const logsInDay = auditLogs.filter((log) => {
        const logDate = new Date(log.created_at);
        return logDate >= dayStart && logDate <= dayEnd;
      });

      const categoryCounts: Record<string, number> = {};
      Object.keys(actionCategories).forEach((cat) => {
        categoryCounts[cat] = logsInDay.filter((log) =>
          actionCategories[cat].includes(log.action)
        ).length;
      });

      return {
        day: format(day, "EEE", { locale: ptBR }),
        date: format(day, "dd/MM"),
        total: logsInDay.length,
        ...categoryCounts,
      };
    });
  }, [auditLogs]);

  // Activity by action type
  const activityByType = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(actionCategories).forEach((cat) => {
      counts[cat] = auditLogs.filter((log) =>
        actionCategories[cat].includes(log.action)
      ).length;
    });
    return Object.entries(counts)
      .map(([category, count]) => ({
        category,
        label: categoryLabels[category],
        count,
        color: categoryColors[category],
      }))
      .sort((a, b) => b.count - a.count);
  }, [auditLogs]);

  // Most active users
  const mostActiveUsers = useMemo(() => {
    const userCounts: Record<string, number> = {};
    auditLogs.forEach((log) => {
      userCounts[log.user_id] = (userCounts[log.user_id] || 0) + 1;
    });

    return Object.entries(userCounts)
      .map(([userId, count]) => ({
        userId,
        count,
        profile: profiles.find((p) => p.id === userId),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [auditLogs, profiles]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const today = startOfDay(now);

    const logsLastHour = auditLogs.filter(
      (log) => new Date(log.created_at) >= oneHourAgo
    );
    const logsToday = auditLogs.filter(
      (log) => new Date(log.created_at) >= today
    );
    const uniqueUsersToday = new Set(logsToday.map((log) => log.user_id)).size;
    const questsCompletedToday = logsToday.filter(
      (log) => log.action === "quest_completed"
    ).length;

    return {
      totalLogs: auditLogs.length,
      logsLastHour: logsLastHour.length,
      logsToday: logsToday.length,
      uniqueUsersToday,
      questsCompletedToday,
    };
  }, [auditLogs]);

  const seo = useSEO();

  return (
    <PageWrapper pageName="Analytics em Tempo Real">
      <SEOHead {...seo} />
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <DesktopBackButton />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">Analytics em Tempo Real</h1>
                  {isLive && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30 animate-pulse">
                      <Radio className="w-3 h-3 mr-1" />
                      AO VIVO
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  Monitoramento de atividade do sistema
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              Atualizado: {format(lastUpdate, "HH:mm:ss")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                setLastUpdate(new Date());
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button
              variant={isLive ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="gap-2"
            >
              <Radio className="w-4 h-4" />
              {isLive ? "Ao Vivo" : "Pausado"}
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalLogs}</p>
                  <p className="text-xs text-muted-foreground">Total de Ações</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.logsLastHour}</p>
                  <p className="text-xs text-muted-foreground">Última Hora</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.logsToday}</p>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.uniqueUsersToday}</p>
                  <p className="text-xs text-muted-foreground">Usuários Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.questsCompletedToday}</p>
                  <p className="text-xs text-muted-foreground">Quests Completas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts */}
        <AnalyticsChartTabs
          hourlyData={hourlyData}
          dailyData={dailyData}
          categoryColors={categoryColors}
          categoryLabels={categoryLabels}
        />

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Activity by Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Atividade por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activityByType.map((item, index) => (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-4"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.count}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              (item.count /
                                Math.max(...activityByType.map((a) => a.count))) *
                              100
                            }%`,
                          }}
                          transition={{ delay: 0.5 + index * 0.05, duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Most Active Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Usuários Mais Ativos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mostActiveUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma atividade registrada
                  </p>
                ) : (
                  mostActiveUsers.map((user, index) => (
                    <motion.div
                      key={user.userId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground",
                          index === 0
                            ? "bg-gradient-to-br from-warning to-warning/70"
                            : index === 1
                            ? "bg-gradient-to-br from-muted-foreground to-muted-foreground/70"
                            : index === 2
                            ? "bg-gradient-to-br from-amber-700 to-amber-700/70"
                            : "bg-gradient-to-br from-primary to-primary/70"
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {user.profile?.display_name || "Usuário"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.profile?.email || user.userId.slice(0, 8)}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        {user.count} ações
                      </Badge>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      </div>
    </PageWrapper>
  );
}
