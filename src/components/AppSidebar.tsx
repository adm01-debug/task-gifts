import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Target, Users, BarChart3, Gift, Settings, Home, Medal, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  badge?: number;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: Target, label: "Quests", badge: 3 },
  { icon: Trophy, label: "Leaderboard" },
  { icon: Users, label: "Equipes" },
  { icon: Gift, label: "Recompensas", badge: 2 },
  { icon: BarChart3, label: "Analytics" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-sm font-bold">
                JD
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border-2 border-sidebar flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">42</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">João Dev</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="w-3 h-3 text-streak streak-fire" />
                <span>12 dias</span>
              </div>
            </div>
          </div>
          
          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">XP até Nível 43</span>
              <span className="text-xp font-semibold">2,450 / 3,000</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full xp-bar rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "82%" }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <motion.button
            key={item.label}
            onClick={() => setActiveItem(item.label)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              "hover:bg-sidebar-accent",
              activeItem === item.label 
                ? "bg-sidebar-accent text-sidebar-primary" 
                : "text-sidebar-foreground/70"
            )}
          >
            <div className="relative">
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                activeItem === item.label && "text-primary"
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
            {!collapsed && activeItem === item.label && (
              <motion.div
                layoutId="activeIndicator"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
              />
            )}
          </motion.button>
        ))}
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
                <span className="text-xs text-muted-foreground">XP Hoje</span>
              </div>
              <p className="font-bold text-xp">+450</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Medal className="w-3 h-3 text-coins coin-shine" />
                <span className="text-xs text-muted-foreground">Coins</span>
              </div>
              <p className="font-bold text-coins">1,250</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings */}
      <div className="p-2 border-t border-sidebar-border">
        <motion.button
          whileHover={{ x: 4 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="font-medium text-sm">Configurações</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
};
