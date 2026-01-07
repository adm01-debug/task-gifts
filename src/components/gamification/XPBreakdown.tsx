import React, { memo, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, Star, BookOpen, Users, Target, Clock,
  Flame, Award, ChevronUp, ChevronDown, Calendar,
  Zap, Trophy, Gift, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

interface XPSource {
  id: string;
  category: 'training' | 'social' | 'attendance' | 'quests' | 'achievements' | 'bonus';
  name: string;
  xpAmount: number;
  timestamp: string;
  multiplier?: number;
}

interface DailyXP {
  date: string;
  training: number;
  social: number;
  attendance: number;
  quests: number;
  achievements: number;
  bonus: number;
  total: number;
}

const mockXPHistory: XPSource[] = [
  { id: '1', category: 'training', name: 'Módulo de Segurança', xpAmount: 150, timestamp: '2024-01-15T10:30:00' },
  { id: '2', category: 'attendance', name: 'Check-in Pontual', xpAmount: 20, timestamp: '2024-01-15T09:00:00' },
  { id: '3', category: 'social', name: 'Kudos Recebido', xpAmount: 10, timestamp: '2024-01-15T14:20:00' },
  { id: '4', category: 'quests', name: 'Quest Diária Completa', xpAmount: 50, timestamp: '2024-01-15T16:00:00' },
  { id: '5', category: 'bonus', name: 'Bônus de Streak 7 dias', xpAmount: 100, timestamp: '2024-01-15T09:00:00', multiplier: 1.5 },
  { id: '6', category: 'achievements', name: 'Conquista: Maratonista', xpAmount: 200, timestamp: '2024-01-14T18:00:00' },
  { id: '7', category: 'training', name: 'Quiz de Compliance', xpAmount: 80, timestamp: '2024-01-14T11:00:00' },
  { id: '8', category: 'social', name: 'Colaboração em Equipe', xpAmount: 30, timestamp: '2024-01-14T15:30:00' }
];

const mockDailyData: DailyXP[] = [
  { date: 'Seg', training: 150, social: 40, attendance: 20, quests: 50, achievements: 0, bonus: 0, total: 260 },
  { date: 'Ter', training: 80, social: 20, attendance: 20, quests: 100, achievements: 200, bonus: 50, total: 470 },
  { date: 'Qua', training: 200, social: 60, attendance: 20, quests: 50, achievements: 0, bonus: 0, total: 330 },
  { date: 'Qui', training: 0, social: 30, attendance: 20, quests: 75, achievements: 0, bonus: 100, total: 225 },
  { date: 'Sex', training: 120, social: 50, attendance: 20, quests: 50, achievements: 150, bonus: 0, total: 390 },
  { date: 'Sáb', training: 50, social: 10, attendance: 0, quests: 25, achievements: 0, bonus: 0, total: 85 },
  { date: 'Dom', training: 0, social: 5, attendance: 0, quests: 0, achievements: 0, bonus: 0, total: 5 }
];

const categoryConfig = {
  training: { label: 'Treinamento', icon: BookOpen, color: '#3b82f6' },
  social: { label: 'Social', icon: Users, color: '#22c55e' },
  attendance: { label: 'Presença', icon: Clock, color: '#f59e0b' },
  quests: { label: 'Quests', icon: Target, color: '#a855f7' },
  achievements: { label: 'Conquistas', icon: Trophy, color: '#ec4899' },
  bonus: { label: 'Bônus', icon: Gift, color: '#06b6d4' }
};

const XPSourceCard = memo(({ source }: { source: XPSource }) => {
  const config = categoryConfig[source.category];
  const Icon = config.icon;
  const time = new Date(source.timestamp).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div 
        className="p-2 rounded-lg"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <Icon className="h-4 w-4" style={{ color: config.color }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">{source.name}</span>
          {source.multiplier && (
            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
              x{source.multiplier}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
      
      <div className="flex items-center gap-1 text-primary font-semibold">
        <Zap className="h-4 w-4" />
        +{source.xpAmount}
      </div>
    </motion.div>
  );
});

XPSourceCard.displayName = 'XPSourceCard';

export const XPBreakdown = memo(() => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState('overview');

  const stats = useMemo(() => {
    const todayTotal = mockXPHistory.reduce((sum, s) => sum + s.xpAmount, 0);
    const weekTotal = mockDailyData.reduce((sum, d) => sum + d.total, 0);
    const avgDaily = Math.round(weekTotal / 7);
    
    const categoryTotals = Object.keys(categoryConfig).map(key => {
      const total = mockDailyData.reduce((sum, d) => sum + (d[key as keyof DailyXP] as number || 0), 0);
      return { name: categoryConfig[key as keyof typeof categoryConfig].label, value: total, color: categoryConfig[key as keyof typeof categoryConfig].color };
    }).filter(c => c.value > 0);

    return { todayTotal, weekTotal, avgDaily, categoryTotals };
  }, []);

  const trend = useMemo(() => {
    const lastWeekTotal = 1500; // Mock
    const change = ((stats.weekTotal - lastWeekTotal) / lastWeekTotal) * 100;
    return { value: Math.abs(change).toFixed(1), isUp: change >= 0 };
  }, [stats.weekTotal]);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Análise de XP
          </CardTitle>
          <div className="flex items-center gap-2">
            {['today', 'week', 'month'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p as typeof period)}
              >
                {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Semanal</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.weekTotal.toLocaleString()}</div>
            <div className={`flex items-center gap-1 text-xs ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isUp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {trend.value}% vs semana anterior
            </div>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Média Diária</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.avgDaily}</div>
            <div className="text-xs text-muted-foreground">XP por dia</div>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Melhor Dia</span>
            </div>
            <div className="text-2xl font-bold text-foreground">470</div>
            <div className="text-xs text-muted-foreground">Terça-feira</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Visão Geral</TabsTrigger>
            <TabsTrigger value="breakdown" className="flex-1">Por Categoria</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockDailyData}>
                  <defs>
                    <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#xpGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryTotals}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stats.categoryTotals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                {stats.categoryTotals.map((cat, index) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm text-foreground">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{cat.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ScrollArea className="h-[250px]">
              <div className="space-y-2 pr-2">
                <AnimatePresence>
                  {mockXPHistory.map((source, index) => (
                    <motion.div
                      key={source.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <XPSourceCard source={source} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <span className="text-sm text-foreground">Continue assim! Você está 15% acima da média</span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
});

XPBreakdown.displayName = 'XPBreakdown';
