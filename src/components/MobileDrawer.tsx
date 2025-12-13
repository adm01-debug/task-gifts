import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Target, Users, BarChart3, Gift, Settings, Home, Medal, X, ClipboardList, PlusCircle, Shield, Activity, BookOpen, Clock, LineChart, ShoppingBag, MessageSquare, TrendingUp, Swords, Heart, Gamepad2, HelpCircle, Bot, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AICoachDialog } from "@/components/AICoachDialog";
import { GlobalSearch } from "@/components/GlobalSearch";
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
  { icon: MessageSquare, label: "Feed Social", path: "/feed" },
  { icon: Trophy, label: "Conquistas", path: "/conquistas" },
  { icon: TrendingUp, label: "Estatísticas", path: "/estatisticas" },
  { icon: Clock, label: "Ponto", path: "/ponto" },
  { icon: Swords, label: "Duelos", path: "/duelos" },
  { icon: Heart, label: "Mentoria", path: "/mentoria" },
  { icon: LineChart, label: "Executivo", path: "/executivo" },
  { icon: BookOpen, label: "Trilhas", path: "/trails" },
  { icon: Gamepad2, label: "Quiz Diário", path: "/quiz" },
  { icon: HelpCircle, label: "Admin Quiz", path: "/quiz/admin" },
  { icon: Target, label: "Quests", badge: 3 },
  { icon: PlusCircle, label: "Criar Quest", path: "/quest-builder" },
  { icon: Users, label: "Equipes" },
  { icon: ClipboardList, label: "Gestor", path: "/manager" },
  { icon: Gift, label: "Loja", path: "/loja", badge: 2 },
  { icon: ShoppingBag, label: "Admin Loja", path: "/loja/admin" },
  { icon: BarChart3, label: "Relatórios", path: "/reports" },
  { icon: Activity, label: "Analytics", path: "/analytics" },
  { icon: Shield, label: "Auditoria", path: "/audit" },
  { icon: Settings, label: "Painel Admin", path: "/admin" },
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

        {/* Global Search, AI Coach & Theme Toggle & Settings */}
        <div className="p-4 pt-0 space-y-2">
          <GlobalSearch
            trigger={
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left flex-1">
                  <span className="font-medium">Buscar</span>
                  <p className="text-xs text-muted-foreground">Trilhas, quests, usuários</p>
                </div>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                  ⌘K
                </kbd>
              </motion.button>
            }
          />

          <AICoachDialog
            trigger={
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:from-primary/20 hover:to-accent/20 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-primary">AI Coach</span>
                  <p className="text-xs text-muted-foreground">Pergunte qualquer coisa</p>
                </div>
              </motion.button>
            }
          />
          
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50">
            <span className="font-medium">Tema</span>
            <ThemeToggle />
          </div>
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
