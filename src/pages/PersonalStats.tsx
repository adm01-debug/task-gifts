import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { useComboHistory } from "@/hooks/useCombo";
import { useUserAchievements } from "@/hooks/useAchievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { WeeklyPerformanceComparison } from "@/components/WeeklyPerformanceComparison";
import { ComboHistory } from "@/components/ComboHistory";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Trophy,
  Zap,
  Target,
  Calendar,
  Award,
  Flame,
  Star,
  Menu,
} from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Hook para buscar histórico de XP dos audit logs
function useXpHistory(userId: string | undefined, days: number = 30) {
  return useQuery({
    queryKey: ["xp-history", userId, days],
    queryFn: async () => {
      if (!userId) return [];

      const startDate = subDays(new Date(), days);
      
      const { data, error } = await supabase
        .from("audit_logs")
        .select("created_at, new_data, metadata")
        .eq("user_id", userId)
        .eq("action", "xp_gained")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Agrupar por dia
      const dailyXp: Record<string, number> = {};
      
      data?.forEach((log) => {
        const day = format(new Date(log.created_at), "yyyy-MM-dd");
        const xpGained = (log.metadata as { xp_gained?: number } | null)?.xp_gained || 0;
        dailyXp[day] = (dailyXp[day] || 0) + xpGained;
      });

      // Preencher dias faltantes
      const allDays = eachDayOfInterval({
        start: startDate,
        end: new Date(),
      });

      return allDays.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        return {
          date: dateStr,
          displayDate: format(day, "dd/MM", { locale: ptBR }),
          xp: dailyXp[dateStr] || 0,
        };
      });
    },
    enabled: !!userId,
  });
}

// Hook para histórico de conquistas
function useAchievementHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ["achievement-history", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_achievements")
        .select(`
          unlocked_at,
          achievements (
            name,
            icon,
            rarity,
            xp_reward
          )
        `)
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: true });

      if (error) throw error;

      // Agrupar por mês
      const monthlyAchievements: Record<string, { count: number; achievements: any[] }> = {};
      
      data?.forEach((ua) => {
        const month = format(new Date(ua.unlocked_at), "yyyy-MM");
        if (!monthlyAchievements[month]) {
          monthlyAchievements[month] = { count: 0, achievements: [] };
        }
        monthlyAchievements[month].count++;
        monthlyAchievements[month].achievements.push(ua.achievements);
      });

      return Object.entries(monthlyAchievements).map(([month, data]) => ({
        month,
        displayMonth: format(new Date(month + "-01"), "MMM/yy", { locale: ptBR }),
        count: data.count,
        achievements: data.achievements,
      }));
    },
    enabled: !!userId,
  });
}

// Hook para estatísticas de quests
function useQuestStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["quest-stats", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data: assignments, error } = await supabase
        .from("quest_assignments")
        .select(`
          completed_at,
          started_at,
          custom_quests (
            difficulty,
            xp_reward
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;

      const completed = assignments?.filter((a) => a.completed_at) || [];
      const inProgress = assignments?.filter((a) => !a.completed_at) || [];

      // Por dificuldade
      const byDifficulty = {
        easy: completed.filter((a) => a.custom_quests?.difficulty === "easy").length,
        medium: completed.filter((a) => a.custom_quests?.difficulty === "medium").length,
        hard: completed.filter((a) => a.custom_quests?.difficulty === "hard").length,
        expert: completed.filter((a) => a.custom_quests?.difficulty === "expert").length,
      };

      return {
        total: assignments?.length || 0,
        completed: completed.length,
        inProgress: inProgress.length,
        byDifficulty,
        totalXpFromQuests: completed.reduce(
          (sum, a) => sum + (a.custom_quests?.xp_reward || 0),
          0
        ),
      };
    },
    enabled: !!userId,
  });
}

const RARITY_COLORS = {
  common: "hsl(var(--muted-foreground))",
  rare: "hsl(217, 91%, 60%)",
  epic: "hsl(271, 91%, 65%)",
  legendary: "hsl(45, 93%, 47%)",
};

const DIFFICULTY_COLORS = {
  easy: "hsl(142, 76%, 36%)",
  medium: "hsl(45, 93%, 47%)",
  hard: "hsl(24, 95%, 53%)",
  expert: "hsl(0, 84%, 60%)",
};

export default function PersonalStats() {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: xpHistory, isLoading: xpLoading } = useXpHistory(user?.id, 30);
  const { data: achievementHistory } = useAchievementHistory(user?.id);
  const { data: userAchievements } = useUserAchievements();
  const { data: questStats } = useQuestStats(user?.id);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Dados para gráfico de raridade de conquistas
  const achievementsByRarity = userAchievements?.reduce(
    (acc, ua) => {
      const achievement = ua.achievement as { rarity?: string } | null;
      const rarity = achievement?.rarity || "common";
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  const rarityData = Object.entries(achievementsByRarity).map(([rarity, count]) => ({
    name: rarity.charAt(0).toUpperCase() + rarity.slice(1),
    value: count,
    color: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS],
  }));

  // Dados para gráfico de quests por dificuldade
  const difficultyData = questStats
    ? Object.entries(questStats.byDifficulty).map(([diff, count]) => ({
        name: diff.charAt(0).toUpperCase() + diff.slice(1),
        value: count,
        color: DIFFICULTY_COLORS[diff as keyof typeof DIFFICULTY_COLORS],
      }))
    : [];

  // Estatísticas resumidas
  const stats = [
    {
      label: "XP Total",
      value: profile?.xp?.toLocaleString() || "0",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "Nível Atual",
      value: profile?.level || 1,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Conquistas",
      value: userAchievements?.length || 0,
      icon: Trophy,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Quests Completas",
      value: questStats?.completed || 0,
      icon: Target,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Melhor Streak",
      value: profile?.best_streak || 0,
      icon: Flame,
      color: "from-red-500 to-orange-500",
    },
    {
      label: "Moedas",
      value: profile?.coins?.toLocaleString() || "0",
      icon: Star,
      color: "from-amber-400 to-yellow-500",
    },
  ];

  const content = (
    <main className="flex-1 overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="flex items-center gap-4 px-4 md:px-6 py-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => isMobile ? setMobileDrawerOpen(true) : setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/60">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Estatísticas Pessoais</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Acompanhe sua evolução ao longo do tempo
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="relative overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`}
                />
                <CardContent className="p-4 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {stat.label}
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* XP Evolution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Evolução de XP - Últimos 30 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              {xpLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ChartContainer
                  config={{
                    xp: { label: "XP", color: "hsl(var(--primary))" },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={xpHistory}>
                      <defs>
                        <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="displayDate"
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) => `Data: ${value}`}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="xp"
                        stroke="hsl(var(--primary))"
                        fill="url(#xpGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Combo History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ComboHistory />
        </motion.div>

        {/* Weekly Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <WeeklyPerformanceComparison />
        </motion.div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Achievements by Rarity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-500" />
                  Conquistas por Raridade
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rarityData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={rarityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {rarityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                      {rarityData.map((entry) => (
                        <div
                          key={entry.name}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span>
                            {entry.name}: {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Nenhuma conquista desbloqueada ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quests by Difficulty */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Quests por Dificuldade
                </CardTitle>
              </CardHeader>
              <CardContent>
                {difficultyData.some((d) => d.value > 0) ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={difficultyData} layout="vertical">
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={60} />
                        <ChartTooltip />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {difficultyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Nenhuma quest completada ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievement Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="md:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Conquistas ao Longo do Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievementHistory && achievementHistory.length > 0 ? (
                  <ChartContainer
                    config={{
                      count: { label: "Conquistas", color: "hsl(var(--primary))" },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={achievementHistory}>
                        <XAxis dataKey="displayMonth" />
                        <YAxis allowDecimals={false} />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              labelFormatter={(value) => `Mês: ${value}`}
                            />
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Nenhuma conquista desbloqueada ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quest Stats Summary */}
        {questStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Resumo de Quests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-3xl font-bold text-primary">
                      {questStats.total}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Atribuídas</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-500/10">
                    <div className="text-3xl font-bold text-green-500">
                      {questStats.completed}
                    </div>
                    <div className="text-sm text-muted-foreground">Completadas</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-yellow-500/10">
                    <div className="text-3xl font-bold text-yellow-500">
                      {questStats.inProgress}
                    </div>
                    <div className="text-sm text-muted-foreground">Em Progresso</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-500/10">
                    <div className="text-3xl font-bold text-purple-500">
                      {questStats.totalXpFromQuests.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">XP de Quests</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Drawer */}
      <MobileDrawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />

      {/* Desktop Sidebar */}
      {!isMobile && (
        <AppSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      )}

      {content}
    </div>
  );
}
