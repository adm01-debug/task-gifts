import { useEffect, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Zap, Flame, Trophy, Target, TrendingUp, Users, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { useUserRank } from "@/hooks/useUserRank";
import { SkeletonStatCard } from "@/components/ui/skeleton";
import { AnimatedFireIndicator } from "@/components/effects/AnimatedFireIndicator";
import { AnimatedTrophyIndicator } from "@/components/effects/AnimatedTrophyIndicator";
import { AnimatedLevelIndicator } from "@/components/effects/AnimatedLevelIndicator";
import { AnimatedCoinsIndicator } from "@/components/effects/AnimatedCoinsIndicator";
import { AnimatedXPParticles } from "@/components/effects/AnimatedXPParticles";
import { MiniConfetti } from "@/components/effects/MiniConfetti";
import { useFirstTimeIndicator } from "@/hooks/useFirstTimeIndicator";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.9,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  color: "primary" | "secondary" | "success" | "warning" | "accent";
  delay?: number;
  isLoading?: boolean;
  pulse?: "primary" | "warning" | "success";
  fireIndicator?: number;
  trophyIndicator?: number;
  levelIndicator?: number;
  coinsIndicator?: number;
  xpParticles?: { active: boolean; gained: number };
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

const pulseClasses = {
  primary: "card-pulse-subtle",
  warning: "card-pulse-warning",
  success: "card-pulse-success",
};

const StatCard = ({ icon: Icon, label, value, change, changeType = "neutral", color, delay = 0, isLoading, pulse, fireIndicator, trophyIndicator, levelIndicator, coinsIndicator, xpParticles }: StatCardProps) => {
  const colors = colorClasses[color];

  if (isLoading) {
    return <SkeletonStatCard />;
  }

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative p-4 rounded-2xl border border-border bg-card overflow-hidden",
        "card-interactive",
        colors.glow,
        pulse && pulseClasses[pulse]
      )}
    >
      {/* XP Particles effect */}
      {xpParticles && (
        <AnimatedXPParticles 
          isActive={xpParticles.active} 
          xpGained={xpParticles.gained}
        />
      )}

      {/* Level indicator for XP card */}
      {levelIndicator !== undefined && levelIndicator > 0 && (
        <AnimatedLevelIndicator level={levelIndicator} />
      )}

      {/* Fire indicator for streak */}
      {fireIndicator !== undefined && fireIndicator > 0 && (
        <AnimatedFireIndicator streakDays={fireIndicator} />
      )}

      {/* Trophy indicator for top 3 ranking */}
      {trophyIndicator !== undefined && trophyIndicator >= 1 && trophyIndicator <= 3 && (
        <AnimatedTrophyIndicator rank={trophyIndicator} />
      )}

      {/* Coins indicator for quests card */}
      {coinsIndicator !== undefined && coinsIndicator >= 100 && (
        <AnimatedCoinsIndicator coins={coinsIndicator} />
      )}

      {/* Gradient background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50",
        colors.bg
      )} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.2, type: "spring", stiffness: 260, damping: 20 }}
            className={cn(
              "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
              colors.bg
            )}
          >
            <Icon className={cn("w-5 h-5", colors.icon)} />
          </motion.div>
          {change && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full",
                changeType === "positive" && "bg-success/10 text-success",
                changeType === "negative" && "bg-destructive/10 text-destructive",
                changeType === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              {changeType === "positive" && <TrendingUp className="w-3 h-3" />}
              {change}
            </motion.div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.25, type: "spring", stiffness: 300 }}
          className="text-2xl font-bold"
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
};

export const StatsGrid = () => {
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: rankData, isLoading: rankLoading } = useUserRank();
  const { checkAndTrigger, celebrationType, clearCelebration } = useFirstTimeIndicator();
  const { playXPSound } = useSoundEffects();

  const isLoading = profileLoading || rankLoading;

  // Track XP changes for real-time particles
  const previousXP = useRef<number | null>(null);
  const [xpParticlesState, setXpParticlesState] = useState({ active: false, gained: 0 });

  // Detect XP changes
  useEffect(() => {
    if (!isLoading && profile?.xp !== undefined) {
      if (previousXP.current !== null && profile.xp > previousXP.current) {
        const gained = profile.xp - previousXP.current;
        setXpParticlesState({ active: true, gained });
        playXPSound();
        
        // Reset after animation
        const timer = setTimeout(() => {
          setXpParticlesState({ active: false, gained: 0 });
        }, 2000);
        
        previousXP.current = profile.xp;
        return () => clearTimeout(timer);
      }
      previousXP.current = profile.xp;
    }
  }, [profile?.xp, isLoading, playXPSound]);

  // Check for first-time indicators when data loads
  useEffect(() => {
    if (!isLoading && profile) {
      if (profile.level && profile.level > 0) {
        checkAndTrigger("level", profile.level);
      }
      if (profile.streak && profile.streak > 0) {
        checkAndTrigger("streak", profile.streak);
      }
    }
  }, [profile, isLoading, checkAndTrigger]);

  useEffect(() => {
    if (!isLoading && rankData?.rank && rankData.rank >= 1 && rankData.rank <= 3) {
      checkAndTrigger("trophy", rankData.rank);
    }
  }, [rankData, isLoading, checkAndTrigger]);

  const stats: StatCardProps[] = [
    {
      icon: Zap,
      label: "XP Total",
      value: profile?.xp?.toLocaleString() || "0",
      change: profile?.xp ? `Nível ${profile.level}` : undefined,
      changeType: "positive",
      color: "success",
      isLoading,
      levelIndicator: profile?.level || 0,
      xpParticles: xpParticlesState,
    },
    {
      icon: Flame,
      label: "Streak Atual",
      value: `${profile?.streak || 0} dias`,
      change: profile?.best_streak ? `Melhor: ${profile.best_streak}` : undefined,
      changeType: "neutral",
      color: "primary",
      isLoading,
      pulse: profile?.streak && profile.streak >= 3 ? "primary" : undefined,
      fireIndicator: profile?.streak || 0,
    },
    {
      icon: Trophy,
      label: "Ranking",
      value: rankData?.rank ? `#${rankData.rank}` : "-",
      change: rankData?.tier || undefined,
      changeType: "positive",
      color: "warning",
      isLoading,
      pulse: rankData?.rank && rankData.rank <= 10 ? "warning" : undefined,
      trophyIndicator: rankData?.rank || undefined,
    },
    {
      icon: Target,
      label: "Quests Completas",
      value: profile?.quests_completed?.toString() || "0",
      change: profile?.coins ? `${profile.coins} coins` : undefined,
      changeType: "positive",
      color: "secondary",
      isLoading,
      coinsIndicator: profile?.coins || 0,
    },
  ];

  return (
    <>
      {/* Celebration confetti for first-time indicators */}
      <MiniConfetti
        isActive={celebrationType !== null}
        type={celebrationType || "level"}
        onComplete={clearCelebration}
      />

      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.1} />
        ))}
      </motion.div>
    </>
  );
};

// Quick Actions variants
const quickActionsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.4,
    },
  },
};

const quickActionItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 15,
    scale: 0.9,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
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
      variants={quickActionsContainerVariants}
      initial="hidden"
      animate="visible"
      className="flex gap-2"
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          variants={quickActionItemVariants}
          whileHover={{ 
            scale: 1.05, 
            y: -2,
            transition: { duration: 0.2 } 
          }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border border-border",
            "bg-gradient-to-r hover:border-primary/30 transition-all duration-200",
            action.color === "primary" && "from-primary/10 to-transparent",
            action.color === "secondary" && "from-secondary/10 to-transparent",
            action.color === "accent" && "from-accent/10 to-transparent"
          )}
        >
          <motion.div
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
          >
            <action.icon className={cn(
              "w-4 h-4",
              action.color === "primary" && "text-primary",
              action.color === "secondary" && "text-secondary",
              action.color === "accent" && "text-accent"
            )} />
          </motion.div>
          <span className="text-sm font-medium">{action.label}</span>
          <motion.div
            initial={{ x: -5, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
          </motion.div>
        </motion.button>
      ))}
    </motion.div>
  );
};
