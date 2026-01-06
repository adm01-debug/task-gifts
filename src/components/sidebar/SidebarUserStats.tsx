import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Medal } from "lucide-react";
import { useCurrentProfile } from "@/hooks/useProfiles";

interface SidebarUserStatsProps {
  collapsed: boolean;
}

export const SidebarUserStats = memo(function SidebarUserStats({ 
  collapsed 
}: SidebarUserStatsProps) {
  const { data: profile } = useCurrentProfile();

  const displayName = profile?.display_name || "Usuário";
  const initials = displayName.substring(0, 2).toUpperCase();
  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const streak = profile?.streak || 0;
  const coins = profile?.coins || 0;

  // Memoized XP calculations
  const { xpInCurrentLevel, xpNeededForNext, xpProgress } = useMemo(() => {
    const xpForLevel = (lvl: number) => Math.floor(100 * Math.pow(1.5, lvl - 1));
    const xpForCurrentLevel = xpForLevel(level);
    const xpForNextLevel = xpForLevel(level + 1);
    const inCurrent = xp - xpForCurrentLevel;
    const neededForNext = xpForNextLevel - xpForCurrentLevel;
    return {
      xpInCurrentLevel: Math.max(0, inCurrent),
      xpNeededForNext: neededForNext,
      xpProgress: neededForNext > 0 ? Math.min(100, (Math.max(0, inCurrent) / neededForNext) * 100) : 0,
    };
  }, [level, xp]);

  // Collapsed mode: compact avatar only
  if (collapsed) {
    return (
      <div className="p-2 border-b border-sidebar-border flex justify-center">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border-2 border-sidebar flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">{level}</span>
          </div>
        </div>
      </div>
    );
  }

  // Expanded mode: full user stats
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 border-b border-sidebar-border"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border-2 border-sidebar flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">{level}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{displayName}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="w-3 h-3 text-streak streak-fire" />
            <span>{streak} dias</span>
          </div>
        </div>
      </div>
      
      {/* XP Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">XP até Nível {level + 1}</span>
          <span className="text-xp font-semibold">
            {xpInCurrentLevel.toLocaleString()} / {xpNeededForNext.toLocaleString()}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full xp-bar rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-xp" />
            <span className="text-xs text-muted-foreground">XP</span>
          </div>
          <p className="font-bold text-sm text-xp">{xp.toLocaleString()}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Medal className="w-3 h-3 text-coins coin-shine" />
            <span className="text-xs text-muted-foreground">Coins</span>
          </div>
          <p className="font-bold text-sm text-coins">{coins.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
});
