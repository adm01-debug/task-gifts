import { motion } from "framer-motion";
import { TrendingUp, Users, Target, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const engagementData = [
  { day: "Seg", xp: 2400, quests: 12 },
  { day: "Ter", xp: 1398, quests: 8 },
  { day: "Qua", xp: 3800, quests: 18 },
  { day: "Qui", xp: 3908, quests: 22 },
  { day: "Sex", xp: 4800, quests: 28 },
  { day: "Sab", xp: 3800, quests: 15 },
  { day: "Dom", xp: 4300, quests: 20 },
];

const teamData = [
  { team: "Eng", score: 8500 },
  { team: "Design", score: 7200 },
  { team: "Product", score: 6800 },
  { team: "Marketing", score: 5400 },
  { team: "Sales", score: 4900 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-border">
        <p className="font-semibold text-sm mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsWidget = () => {
  const metrics = [
    { label: "Usuários Ativos", value: "2,847", change: "+12%", positive: true, icon: Users },
    { label: "Taxa de Engajamento", value: "78%", change: "+5%", positive: true, icon: TrendingUp },
    { label: "Quests/Dia", value: "156", change: "-3%", positive: false, icon: Target },
    { label: "XP Distribuído", value: "45.2K", change: "+18%", positive: true, icon: Zap },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div>
              <h3 className="font-bold">Analytics</h3>
              <p className="text-xs text-muted-foreground">Última semana</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-xs text-primary font-medium"
          >
            Ver detalhes →
          </motion.button>
        </div>
      </div>

      {/* Mini metrics */}
      <div className="p-4 grid grid-cols-2 gap-3 border-b border-border">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="p-3 rounded-xl bg-muted/30"
          >
            <div className="flex items-center justify-between mb-1">
              <metric.icon className="w-4 h-4 text-muted-foreground" />
              <div className={`flex items-center gap-0.5 text-[10px] font-medium ${
                metric.positive ? "text-success" : "text-destructive"
              }`}>
                {metric.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {metric.change}
              </div>
            </div>
            <p className="text-lg font-bold">{metric.value}</p>
            <p className="text-[10px] text-muted-foreground">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-4">
        <p className="text-sm font-medium mb-3">XP Ganho por Dia</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={engagementData}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                fill="url(#xpGradient)"
                name="XP"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Performance */}
      <div className="p-4 border-t border-border">
        <p className="text-sm font-medium mb-3">Performance por Equipe</p>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="team" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="score"
                fill="hsl(var(--secondary))"
                radius={[0, 4, 4, 0]}
                name="Score"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};
