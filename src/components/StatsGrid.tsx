import { motion } from "framer-motion";
import { Zap, Flame, Trophy, Target, TrendingUp, Users, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  color: "primary" | "secondary" | "success" | "warning" | "accent";
  delay?: number;
}

const colorClasses = {
  primary: {
    bg: "from-primary/20 to-primary/5",
    icon: "text-primary",
    glow: "shadow-[0_0_30px_hsl(var(--primary)/0.2)]",
  },
  secondary: {
    bg: "from-secondary/20 to-secondary/5",
    icon: "text-secondary",
    glow: "shadow-[0_0_30px_hsl(var(--secondary)/0.2)]",
  },
  success: {
    bg: "from-success/20 to-success/5",
    icon: "text-success",
    glow: "shadow-[0_0_30px_hsl(var(--success)/0.2)]",
  },
  warning: {
    bg: "from-warning/20 to-warning/5",
    icon: "text-warning",
    glow: "shadow-[0_0_30px_hsl(var(--warning)/0.2)]",
  },
  accent: {
    bg: "from-accent/20 to-accent/5",
    icon: "text-accent",
    glow: "shadow-[0_0_30px_hsl(var(--accent)/0.2)]",
  },
};

const StatCard = ({ icon: Icon, label, value, change, changeType = "neutral", color, delay = 0 }: StatCardProps) => {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative p-4 rounded-2xl border border-border bg-card overflow-hidden",
        "hover:border-primary/30 transition-colors duration-300",
        colors.glow
      )}
    >
      {/* Gradient background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50",
        colors.bg
      )} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
            colors.bg
          )}>
            <Icon className={cn("w-5 h-5", colors.icon)} />
          </div>
          {change && (
            <div className={cn(
              "flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full",
              changeType === "positive" && "bg-success/10 text-success",
              changeType === "negative" && "bg-destructive/10 text-destructive",
              changeType === "neutral" && "bg-muted text-muted-foreground"
            )}>
              {changeType === "positive" && <TrendingUp className="w-3 h-3" />}
              {change}
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="text-2xl font-bold"
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
};

export const StatsGrid = () => {
  const stats: StatCardProps[] = [
    {
      icon: Zap,
      label: "XP Total",
      value: "9,650",
      change: "+450 hoje",
      changeType: "positive",
      color: "success",
    },
    {
      icon: Flame,
      label: "Streak Atual",
      value: "12 dias",
      change: "Melhor: 28",
      changeType: "neutral",
      color: "primary",
    },
    {
      icon: Trophy,
      label: "Ranking",
      value: "#4",
      change: "↑ 2 posições",
      changeType: "positive",
      color: "warning",
    },
    {
      icon: Target,
      label: "Quests Completas",
      value: "127",
      change: "+8 esta semana",
      changeType: "positive",
      color: "secondary",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} delay={i * 0.1} />
      ))}
    </div>
  );
};

// Additional component for quick actions
export const QuickActions = () => {
  const actions = [
    { icon: Target, label: "Nova Quest", color: "primary" },
    { icon: Users, label: "Desafio", color: "secondary" },
    { icon: Clock, label: "Evento", color: "accent" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex gap-2"
    >
      {actions.map((action) => (
        <motion.button
          key={action.label}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border border-border",
            "bg-gradient-to-r hover:border-primary/30 transition-all duration-200",
            action.color === "primary" && "from-primary/10 to-transparent",
            action.color === "secondary" && "from-secondary/10 to-transparent",
            action.color === "accent" && "from-accent/10 to-transparent"
          )}
        >
          <action.icon className={cn(
            "w-4 h-4",
            action.color === "primary" && "text-primary",
            action.color === "secondary" && "text-secondary",
            action.color === "accent" && "text-accent"
          )} />
          <span className="text-sm font-medium">{action.label}</span>
          <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
        </motion.button>
      ))}
    </motion.div>
  );
};
