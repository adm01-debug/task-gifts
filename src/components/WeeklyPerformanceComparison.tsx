import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Zap, Target, Award, Flame, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyMetrics {
  xpGained: number;
  questsCompleted: number;
  kudosGiven: number;
  kudosReceived: number;
  maxComboMultiplier: number;
  punctualDays: number;
}

async function fetchWeeklyMetrics(userId: string, weekStart: Date, weekEnd: Date): Promise<WeeklyMetrics> {
  const startStr = format(weekStart, 'yyyy-MM-dd');
  const endStr = format(weekEnd, 'yyyy-MM-dd');

  // Fetch XP gained from audit logs
  const { data: xpLogs } = await supabase
    .from('audit_logs')
    .select('new_data')
    .eq('user_id', userId)
    .eq('action', 'xp_gained')
    .gte('created_at', startStr)
    .lte('created_at', endStr + 'T23:59:59');

  const xpGained = xpLogs?.reduce((sum, log) => {
    const data = log.new_data as { xp_amount?: number } | null;
    return sum + (data?.xp_amount || 0);
  }, 0) || 0;

  // Fetch quests completed
  const { data: questLogs } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('action', 'quest_completed')
    .gte('created_at', startStr)
    .lte('created_at', endStr + 'T23:59:59');

  const questsCompleted = questLogs?.length || 0;

  // Fetch kudos given
  const { data: kudosGivenData } = await supabase
    .from('kudos')
    .select('id')
    .eq('from_user_id', userId)
    .gte('created_at', startStr)
    .lte('created_at', endStr + 'T23:59:59');

  const kudosGiven = kudosGivenData?.length || 0;

  // Fetch kudos received
  const { data: kudosReceivedData } = await supabase
    .from('kudos')
    .select('id')
    .eq('to_user_id', userId)
    .gte('created_at', startStr)
    .lte('created_at', endStr + 'T23:59:59');

  const kudosReceived = kudosReceivedData?.length || 0;

  // Fetch max combo multiplier
  const { data: combos } = await supabase
    .from('user_combos')
    .select('max_multiplier_reached')
    .eq('user_id', userId)
    .gte('combo_date', startStr)
    .lte('combo_date', endStr);

  const maxComboMultiplier = combos?.reduce((max, combo) => 
    Math.max(max, Number(combo.max_multiplier_reached)), 1) || 1;

  // Fetch punctual attendance days
  const { data: attendance } = await supabase
    .from('attendance_records')
    .select('id')
    .eq('user_id', userId)
    .eq('is_punctual', true)
    .gte('check_in', startStr)
    .lte('check_in', endStr + 'T23:59:59');

  const punctualDays = attendance?.length || 0;

  return {
    xpGained,
    questsCompleted,
    kudosGiven,
    kudosReceived,
    maxComboMultiplier,
    punctualDays
  };
}

function calculateChange(current: number, previous: number): { value: number; trend: 'up' | 'down' | 'same' } {
  if (previous === 0 && current === 0) return { value: 0, trend: 'same' };
  if (previous === 0) return { value: 100, trend: 'up' };
  
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(Math.round(change)),
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
  };
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'same' }) {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

export function WeeklyPerformanceComparison() {
  const { user } = useAuth();

  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const previousWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const previousWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const { data: currentWeek, isLoading: loadingCurrent } = useQuery({
    queryKey: ['weekly-performance', 'current', user?.id],
    queryFn: () => fetchWeeklyMetrics(user!.id, currentWeekStart, currentWeekEnd),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: previousWeek, isLoading: loadingPrevious } = useQuery({
    queryKey: ['weekly-performance', 'previous', user?.id],
    queryFn: () => fetchWeeklyMetrics(user!.id, previousWeekStart, previousWeekEnd),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  if (loadingCurrent || loadingPrevious) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentWeek || !previousWeek) return null;

  const metrics = [
    {
      label: "XP Ganho",
      icon: Zap,
      current: currentWeek.xpGained,
      previous: previousWeek.xpGained,
      format: (v: number) => v.toLocaleString('pt-BR'),
      color: "from-yellow-500/20 to-orange-500/20",
      iconColor: "text-yellow-500"
    },
    {
      label: "Quests",
      icon: Target,
      current: currentWeek.questsCompleted,
      previous: previousWeek.questsCompleted,
      format: (v: number) => v.toString(),
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500"
    },
    {
      label: "Kudos Dados",
      icon: Award,
      current: currentWeek.kudosGiven,
      previous: previousWeek.kudosGiven,
      format: (v: number) => v.toString(),
      color: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-500"
    },
    {
      label: "Kudos Recebidos",
      icon: Users,
      current: currentWeek.kudosReceived,
      previous: previousWeek.kudosReceived,
      format: (v: number) => v.toString(),
      color: "from-purple-500/20 to-violet-500/20",
      iconColor: "text-purple-500"
    },
    {
      label: "Max Combo",
      icon: Flame,
      current: currentWeek.maxComboMultiplier,
      previous: previousWeek.maxComboMultiplier,
      format: (v: number) => `${v.toFixed(1)}x`,
      color: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-500"
    },
    {
      label: "Dias Pontuais",
      icon: TrendingUp,
      current: currentWeek.punctualDays,
      previous: previousWeek.punctualDays,
      format: (v: number) => v.toString(),
      color: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-500"
    }
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Comparativo Semanal
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {format(currentWeekStart, "dd MMM", { locale: ptBR })} - {format(currentWeekEnd, "dd MMM", { locale: ptBR })} vs semana anterior
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {metrics.map((metric, index) => {
            const change = calculateChange(metric.current, metric.previous);
            const Icon = metric.icon;
            
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative p-3 rounded-lg bg-gradient-to-br ${metric.color} border border-border/30`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${metric.iconColor}`} />
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={change.trend} />
                    <span className={`text-xs font-medium ${
                      change.trend === 'up' ? 'text-green-500' : 
                      change.trend === 'down' ? 'text-red-500' : 
                      'text-muted-foreground'
                    }`}>
                      {change.value}%
                    </span>
                  </div>
                </div>
                <p className="text-lg font-bold">{metric.format(metric.current)}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  anterior: {metric.format(metric.previous)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
