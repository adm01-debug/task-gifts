import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Activity,
  Calendar,
  Award,
  Flame,
  BookOpen,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useProfiles } from "@/hooks/useProfiles";
import { useDepartments } from "@/hooks/useDepartments";
import { useAllTeamMembers } from "@/hooks/useAdminUsers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, eachDayOfInterval, subMonths, startOfMonth, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4"];

// Fetch attendance data for charts
function useAttendanceStats() {
  return useQuery({
    queryKey: ["admin-attendance-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      
      const { data, error } = await supabase
        .from("attendance_records")
        .select("check_in, is_punctual, user_id")
        .gte("check_in", thirtyDaysAgo)
        .order("check_in", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });
}

// Fetch quiz activity
function useQuizActivity() {
  return useQuery({
    queryKey: ["admin-quiz-activity"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      
      const { data, error } = await supabase
        .from("quiz_scores")
        .select("played_at, score, user_id")
        .gte("played_at", thirtyDaysAgo)
        .order("played_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });
}

// Fetch trail enrollments
function useTrailEnrollments() {
  return useQuery({
    queryKey: ["admin-trail-enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trail_enrollments")
        .select("started_at, completed_at, user_id")
        .order("started_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });
}

// Fetch user signups over time
function useUserSignups() {
  return useQuery({
    queryKey: ["admin-user-signups"],
    queryFn: async () => {
      const sixMonthsAgo = subMonths(new Date(), 6).toISOString();
      
      const { data, error } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", sixMonthsAgo)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });
}

export function AdminMetricsDashboard() {
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: departments } = useDepartments();
  const { data: teamMembers } = useAllTeamMembers();
  const { data: attendanceData } = useAttendanceStats();
  const { data: quizData } = useQuizActivity();
  const { data: enrollmentsData } = useTrailEnrollments();
  const { data: signupsData } = useUserSignups();

  // Process user growth data (monthly)
  const userGrowthData = useMemo(() => {
    if (!signupsData) return [];

    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    let cumulative = 0;
    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = startOfMonth(subMonths(month, -1));
      
      const newUsers = signupsData.filter((u) => {
        const date = new Date(u.created_at);
        return date >= monthStart && date < monthEnd;
      }).length;
      
      cumulative += newUsers;
      
      return {
        month: format(month, "MMM", { locale: ptBR }),
        novos: newUsers,
        total: cumulative,
      };
    });
  }, [signupsData]);

  // Process daily activity data
  const dailyActivityData = useMemo(() => {
    if (!attendanceData) return [];

    const days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date(),
    });

    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = startOfDay(subDays(day, -1));
      
      const dayAttendance = attendanceData.filter((a) => {
        const date = new Date(a.check_in);
        return date >= dayStart && date < dayEnd;
      });

      const uniqueUsers = new Set(dayAttendance.map((a) => a.user_id)).size;
      const punctualCount = dayAttendance.filter((a) => a.is_punctual).length;
      
      return {
        day: format(day, "dd/MM"),
        checkins: dayAttendance.length,
        usuarios: uniqueUsers,
        pontuais: punctualCount,
      };
    });
  }, [attendanceData]);

  // Process department distribution
  const departmentDistribution = useMemo(() => {
    if (!departments || !teamMembers) return [];

    return departments.map((dept) => {
      const memberCount = teamMembers.filter((tm) => tm.department_id === dept.id).length;
      return {
        name: dept.name,
        value: memberCount,
        color: dept.color || COLORS[departments.indexOf(dept) % COLORS.length],
      };
    }).filter((d) => d.value > 0);
  }, [departments, teamMembers]);

  // Process level distribution
  const levelDistribution = useMemo(() => {
    if (!profiles) return [];

    const levelGroups: Record<string, number> = {
      "1-5": 0,
      "6-10": 0,
      "11-20": 0,
      "21-50": 0,
      "51+": 0,
    };

    profiles.forEach((p) => {
      if (p.level <= 5) levelGroups["1-5"]++;
      else if (p.level <= 10) levelGroups["6-10"]++;
      else if (p.level <= 20) levelGroups["11-20"]++;
      else if (p.level <= 50) levelGroups["21-50"]++;
      else levelGroups["51+"]++;
    });

    return Object.entries(levelGroups).map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i],
    }));
  }, [profiles]);

  // Process quiz activity
  const quizActivityData = useMemo(() => {
    if (!quizData) return [];

    const days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date(),
    });

    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = startOfDay(subDays(day, -1));
      
      const dayQuizzes = quizData.filter((q) => {
        const date = new Date(q.played_at);
        return date >= dayStart && date < dayEnd;
      });

      const totalScore = dayQuizzes.reduce((sum, q) => sum + q.score, 0);
      const avgScore = dayQuizzes.length > 0 ? Math.round(totalScore / dayQuizzes.length) : 0;
      
      return {
        day: format(day, "dd/MM"),
        partidas: dayQuizzes.length,
        mediaScore: avgScore,
      };
    });
  }, [quizData]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalUsers = profiles?.length || 0;
    const avgLevel = profiles?.length 
      ? Math.round(profiles.reduce((sum, p) => sum + p.level, 0) / profiles.length * 10) / 10 
      : 0;
    const totalXP = profiles?.reduce((sum, p) => sum + p.xp, 0) || 0;
    const activeToday = attendanceData 
      ? new Set(attendanceData.filter((a) => {
          const today = startOfDay(new Date());
          return new Date(a.check_in) >= today;
        }).map((a) => a.user_id)).size
      : 0;
    const completedTrails = enrollmentsData?.filter((e) => e.completed_at).length || 0;
    const inProgressTrails = enrollmentsData?.filter((e) => !e.completed_at).length || 0;

    return {
      totalUsers,
      avgLevel,
      totalXP,
      activeToday,
      completedTrails,
      inProgressTrails,
      dau: totalUsers > 0 ? Math.round((activeToday / totalUsers) * 100) : 0,
    };
  }, [profiles, attendanceData, enrollmentsData]);

  if (profilesLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[300px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Usuários", value: summaryStats.totalUsers, icon: Users, color: "#6366f1" },
          { label: "DAU Hoje", value: `${summaryStats.dau}%`, icon: Activity, color: "#10b981" },
          { label: "Nível Médio", value: summaryStats.avgLevel, icon: Award, color: "#f59e0b" },
          { label: "Trilhas Concluídas", value: summaryStats.completedTrails, icon: BookOpen, color: "#8b5cf6" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-primary" />
                Crescimento de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Total Acumulado"
                      stroke="#6366f1"
                      fill="url(#colorTotal)"
                      strokeWidth={2}
                    />
                    <Bar dataKey="novos" name="Novos" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-primary" />
                Atividade Diária (14 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="day" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="checkins" name="Check-ins" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pontuais" name="Pontuais" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-4 h-4 text-primary" />
                Distribuição por Departamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {departmentDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {departmentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value} membros`, '']}
                      />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        formatter={(value) => <span className="text-xs">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Level Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="w-4 h-4 text-primary" />
                Distribuição por Nível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      className="text-xs" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value} usuários`, '']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {levelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quiz Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Flame className="w-4 h-4 text-primary" />
                Atividade de Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quizActivityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="day" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="partidas"
                      name="Partidas"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: '#6366f1' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mediaScore"
                      name="Score Médio"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
