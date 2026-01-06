import { motion } from "framer-motion";
import { Flame, Zap, Gift, Settings, Home, Medal, Target, Trophy, TrendingUp, Clock, BookOpen, Gamepad2, ShoppingBag, MessageSquare, Swords, Heart, Award, ClipboardCheck, BarChart3, Megaphone, Globe, Shield } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { LanguageSelector } from "@/components/LanguageSelector";

interface NavItem {
  icon: React.ElementType;
  label: string;
  badge?: number;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Target, label: "Metas & OKRs", path: "/goals" },
  { icon: ClipboardCheck, label: "Check-ins 1:1", path: "/checkins" },
  { icon: Award, label: "Ligas", path: "/leagues" },
  { icon: BarChart3, label: "Pulse Surveys", path: "/surveys" },
  { icon: MessageSquare, label: "Feedback 360°", path: "/feedback" },
  { icon: Megaphone, label: "Anúncios", path: "/announcements" },
  { icon: Trophy, label: "Conquistas", path: "/conquistas" },
  { icon: TrendingUp, label: "Estatísticas", path: "/estatisticas" },
  { icon: Clock, label: "Ponto", path: "/ponto" },
  { icon: BookOpen, label: "Trilhas", path: "/trails" },
  { icon: Gamepad2, label: "Quiz Diário", path: "/quiz" },
  { icon: Swords, label: "Duelos", path: "/duelos" },
  { icon: Heart, label: "Mentoria", path: "/mentoria" },
  { icon: ShoppingBag, label: "Loja", path: "/loja", badge: 2 },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
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
      xpInCurrentLevel: inCurrent,
      xpNeededForNext: neededForNext,
      xpProgress: neededForNext > 0 ? Math.min(100, (inCurrent / neededForNext) * 100) : 0,
    };
  }, [level, xp]);

  // Memoized handlers
  const handleItemClick = useCallback((item: NavItem) => {
    navigate(item.path);
  }, [navigate]);
  const handleNavigateToProfile = useCallback(() => navigate("/profile"), [navigate]);

  return (
    <motion.aside
      data-tour="sidebar"
      id="main-nav"
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
      role="navigation"
      aria-label="Menu lateral principal"
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <motion.div 
          className="flex items-center gap-3"
          animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
              <Gift className="w-5 h-5 text-primary-foreground" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <h1 className="font-bold text-lg text-sidebar-foreground">Task Gifts</h1>
              <p className="text-xs text-muted-foreground">Gamify your work</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* User Stats Mini */}
      {!collapsed && (
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
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto" aria-label="Navegação principal">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path !== "/" && currentPath.startsWith(item.path));
          return (
            <motion.button
              key={item.label}
              onClick={() => handleItemClick(item)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-primary" 
                  : "text-sidebar-foreground/70"
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive && "text-primary"
                )} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              {!collapsed && isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t border-sidebar-border"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-3 h-3 text-xp" />
                <span className="text-xs text-muted-foreground">XP Total</span>
              </div>
              <p className="font-bold text-xp">{xp.toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Medal className="w-3 h-3 text-coins coin-shine" />
                <span className="text-xs text-muted-foreground">Coins</span>
              </div>
              <p className="font-bold text-coins">{coins.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Language Selector */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-3 pb-2"
        >
          <LanguageSelector compact={false} className="w-full" />
        </motion.div>
      )}

      {/* Admin Links */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={() => navigate("/security")}
          aria-label="Segurança"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
        >
          <Shield className="w-5 h-5" />
          {!collapsed && <span className="font-medium text-sm">Segurança</span>}
        </motion.button>
        <motion.button
          whileHover={{ x: 4 }}
          onClick={handleNavigateToProfile}
          aria-label="Configurações"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="font-medium text-sm">Configurações</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
};
