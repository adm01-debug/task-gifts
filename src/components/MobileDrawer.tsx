import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Target, Users, BarChart3, Gift, Settings, Home, Medal, X, ClipboardList, PlusCircle, Shield, Activity, BookOpen } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface NavItem {
  icon: React.ElementType;
  label: string;
  badge?: number;
  path?: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BookOpen, label: "Trilhas", path: "/trails" },
  { icon: Target, label: "Quests", badge: 3 },
  { icon: PlusCircle, label: "Criar Quest", path: "/quest-builder" },
  { icon: Trophy, label: "Leaderboard" },
  { icon: Users, label: "Equipes" },
  { icon: ClipboardList, label: "Gestor", path: "/manager" },
  { icon: Gift, label: "Recompensas", badge: 2 },
  { icon: BarChart3, label: "Relatórios", path: "/reports" },
  { icon: Activity, label: "Analytics", path: "/analytics" },
  { icon: Shield, label: "Auditoria", path: "/audit" },
];

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const MobileDrawer = ({ open, onClose }: MobileDrawerProps) => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navigate = useNavigate();

  const handleItemClick = (item: NavItem) => {
    setActiveItem(item.label);
    if (item.path) {
      navigate(item.path);
    }
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
                  <Gift className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div>
                <DrawerTitle className="text-left">Task Gifts</DrawerTitle>
                <p className="text-xs text-muted-foreground">Gamify your work</p>
              </div>
            </div>
            <DrawerClose asChild>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* User Stats */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-lg font-bold">
                JD
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-background flex items-center justify-center">
                <span className="text-xs font-bold text-primary">42</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold">João Dev</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flame className="w-4 h-4 text-streak streak-fire" />
                <span>12 dias de streak</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">XP até Nível 43</span>
              <span className="text-success font-semibold">2,450 / 3,000</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full xp-bar rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "82%" }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all",
                "active:scale-[0.98]",
                activeItem === item.label
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "hover:bg-muted"
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "w-6 h-6",
                  activeItem === item.label && "text-primary"
                )} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-xs font-bold flex items-center justify-center text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="font-medium text-base">{item.label}</span>
              {activeItem === item.label && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="ml-auto w-2 h-2 rounded-full bg-primary"
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-border">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-success" />
                <span className="text-sm text-muted-foreground">XP Hoje</span>
              </div>
              <p className="text-xl font-bold text-success">+450</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Medal className="w-4 h-4 text-warning coin-shine" />
                <span className="text-sm text-muted-foreground">Coins</span>
              </div>
              <p className="text-xl font-bold text-warning">1,250</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 pt-0">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
          >
            <Settings className="w-6 h-6" />
            <span className="font-medium">Configurações</span>
          </motion.button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
