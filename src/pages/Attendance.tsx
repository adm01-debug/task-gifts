import { motion } from "framer-motion";
import { 
  Clock, 
  Calendar, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Target,
  Award,
  Timer
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { SEOHead } from "@/components/SEOHead";
import { useSEO } from "@/hooks/useSEO";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  useUserStreak, 
  useTodayAttendance, 
  useRecentAttendance,
  useCheckIn,
  useCheckOut,
  useAttendanceSettings
} from "@/hooks/useAttendance";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useMemo } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

const Attendance = () => {
  const navigate = useNavigate();
  const seoData = useSEO();
  const [selectedMonth] = useState(new Date());
  
  const { data: streak } = useUserStreak();
  const { data: todayRecord } = useTodayAttendance();
  const { data: recentRecords } = useRecentAttendance(30);
  const { data: settings } = useAttendanceSettings();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    if (!recentRecords) return { punctual: 0, late: 0, absent: 0, total: 0, punctualityRate: 0 };
    
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const workDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
      .filter(day => !isWeekend(day) && day <= new Date());
    
    const punctual = recentRecords.filter(r => r.is_punctual).length;
    const late = recentRecords.filter(r => !r.is_punctual).length;
    const total = recentRecords.length;
    const absent = Math.max(0, workDays.length - total);
    const punctualityRate = total > 0 ? (punctual / total) * 100 : 0;

    return { punctual, late, absent, total, punctualityRate };
  }, [recentRecords, selectedMonth]);

  // Prepare chart data - weekly punctuality trend
  const weeklyTrendData = useMemo(() => {
    if (!recentRecords) return [];
    
    const weeks: Record<string, { punctual: number; total: number }> = {};
    
    recentRecords.forEach(record => {
      const date = parseISO(record.check_in);
      const weekStart = format(date, "'Sem' w", { locale: ptBR });
      
      if (!weeks[weekStart]) {
        weeks[weekStart] = { punctual: 0, total: 0 };
      }
      weeks[weekStart].total++;
      if (record.is_punctual) weeks[weekStart].punctual++;
    });

    return Object.entries(weeks).map(([week, data]) => ({
      week,
      rate: data.total > 0 ? Math.round((data.punctual / data.total) * 100) : 0,
      punctual: data.punctual,
      total: data.total
    })).slice(-4);
  }, [recentRecords]);

  // Daily check-in times chart
  const checkInTimesData = useMemo(() => {
    if (!recentRecords) return [];
    
    return recentRecords.slice(0, 7).reverse().map(record => {
      const checkInTime = parseISO(record.check_in);
      const hours = checkInTime.getHours();
      const minutes = checkInTime.getMinutes();
      const timeInMinutes = hours * 60 + minutes;
      
      return {
        day: format(checkInTime, "EEE", { locale: ptBR }),
        time: timeInMinutes,
        displayTime: format(checkInTime, "HH:mm"),
        isPunctual: record.is_punctual
      };
    });
  }, [recentRecords]);

  // Pie chart data
  const pieData = useMemo(() => [
    { name: 'Pontual', value: monthlyStats.punctual, color: 'hsl(var(--success))' },
    { name: 'Atrasado', value: monthlyStats.late, color: 'hsl(var(--warning))' },
    { name: 'Ausente', value: monthlyStats.absent, color: 'hsl(var(--muted))' }
  ].filter(d => d.value > 0), [monthlyStats]);

  const handleCheckIn = () => checkIn.mutate();
  const handleCheckOut = () => checkOut.mutate();

  const targetMinutes = settings ? 
    parseInt(settings.work_start_time.split(':')[0]) * 60 + 
    parseInt(settings.work_start_time.split(':')[1]) : 
    480; // 8:00 default

  return (
    <PageWrapper pageName="Ponto" className="min-h-screen bg-background">
      <SEOHead {...seoData} />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <DesktopBackButton />
            <div>
              <h1 className="text-2xl font-bold">Controle de Ponto</h1>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions & Today Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Check-in/out Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Registro de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Entrada</p>
                  <p className="text-2xl font-bold">
                    {todayRecord?.check_in 
                      ? format(parseISO(todayRecord.check_in), "HH:mm")
                      : "--:--"
                    }
                  </p>
                  {todayRecord?.is_punctual !== undefined && (
                    <Badge variant={todayRecord.is_punctual ? "default" : "destructive"} className="mt-2">
                      {todayRecord.is_punctual ? "Pontual" : `${todayRecord.late_minutes}min atrasado`}
                    </Badge>
                  )}
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Saída</p>
                  <p className="text-2xl font-bold">
                    {todayRecord?.check_out 
                      ? format(parseISO(todayRecord.check_out), "HH:mm")
                      : "--:--"
                    }
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={handleCheckIn}
                  disabled={!!todayRecord?.check_in || checkIn.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {checkIn.isPending ? "Registrando..." : "Check-in"}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCheckOut}
                  disabled={!todayRecord?.check_in || !!todayRecord?.check_out || checkOut.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {checkOut.isPending ? "Registrando..." : "Check-out"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-streak" />
                Streak de Pontualidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <motion.p 
                    className="text-4xl font-bold text-streak"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    {streak?.current_streak || 0}
                  </motion.p>
                  <p className="text-sm text-muted-foreground">Atual</p>
                </div>
                <div>
                  <motion.p 
                    className="text-4xl font-bold text-primary"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    {streak?.best_streak || 0}
                  </motion.p>
                  <p className="text-sm text-muted-foreground">Recorde</p>
                </div>
                <div>
                  <motion.p 
                    className="text-4xl font-bold text-success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                  >
                    {streak?.total_punctual_days || 0}
                  </motion.p>
                  <p className="text-sm text-muted-foreground">Total Pontuais</p>
                </div>
              </div>

              {/* Next milestone */}
              {settings && streak && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Próximo Milestone</span>
                    <span className="text-sm font-medium">
                      {streak.current_streak} / {settings.streak_milestone} dias
                    </span>
                  </div>
                  <Progress 
                    value={(streak.current_streak / settings.streak_milestone) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    +{settings.xp_streak_bonus} XP bônus ao atingir {settings.streak_milestone} dias
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa Pontualidade</p>
                    <p className="text-3xl font-bold text-success">
                      {monthlyStats.punctualityRate.toFixed(0)}%
                    </p>
                  </div>
                  <Target className="w-10 h-10 text-success/20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Dias Pontuais</p>
                    <p className="text-3xl font-bold text-primary">{monthlyStats.punctual}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Dias Atrasados</p>
                    <p className="text-3xl font-bold text-warning">{monthlyStats.late}</p>
                  </div>
                  <Timer className="w-10 h-10 text-warning/20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">XP Ganho</p>
                    <p className="text-3xl font-bold text-xp">
                      +{monthlyStats.punctual * (settings?.xp_punctual_checkin || 15)}
                    </p>
                  </div>
                  <Award className="w-10 h-10 text-xp/20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Calendar View */}
        <AttendanceCalendar records={recentRecords || []} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trend Chart */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Tendência Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="week" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Taxa de Pontualidade']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Check-in Times Chart */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Horários de Check-in (Últimos 7 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={checkInTimesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      domain={[420, 600]}
                      tickFormatter={(value) => {
                        const hours = Math.floor(value / 60);
                        const mins = value % 60;
                        return `${hours}:${mins.toString().padStart(2, '0')}`;
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string, props: { payload: { displayTime?: string } }) => [
                        props.payload.displayTime || String(value), 
                        'Check-in'
                      ]}
                    />
                    <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                      {checkInTimesData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isPunctual ? 'hsl(var(--success))' : 'hsl(var(--warning))'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-success" />
                  <span className="text-muted-foreground">Pontual</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-warning" />
                  <span className="text-muted-foreground">Atrasado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History Table */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Histórico de Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRecords?.slice(0, 10).map((record) => {
                  const checkInDate = parseISO(record.check_in);
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {format(checkInDate, "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{format(checkInDate, "HH:mm")}</TableCell>
                      <TableCell>
                        {record.check_out 
                          ? format(parseISO(record.check_out), "HH:mm")
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.is_punctual ? "default" : "destructive"}>
                          {record.is_punctual ? "Pontual" : `${record.late_minutes}min atraso`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={record.is_punctual ? "text-success font-medium" : "text-muted-foreground"}>
                          {record.is_punctual ? `+${settings?.xp_punctual_checkin || 15}` : "0"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!recentRecords || recentRecords.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum registro de ponto encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </PageWrapper>
  );
};

export default Attendance;
