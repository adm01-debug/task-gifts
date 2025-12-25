import { memo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Target, Trophy, User, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Target, label: "Metas", path: "/goals" },
  { icon: Trophy, label: "Ranking", path: "/leagues" },
  { icon: BookOpen, label: "Trilhas", path: "/trails" },
  { icon: User, label: "Perfil", path: "/profile" },
];

interface MobileBottomNavProps {
  className?: string;
}

export const MobileBottomNav = memo(function MobileBottomNav({ className }: MobileBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const haptic = useHapticFeedback();

  const handleNavClick = useCallback((path: string) => {
    haptic.buttonPress();
    navigate(path);
  }, [navigate, haptic]);

  const isActive = useCallback((path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-xl border-t border-border/50",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "flex flex-col items-center justify-center",
                "min-w-[56px] min-h-[44px] px-3 py-2 rounded-xl",
                "transition-colors duration-200",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  active && "scale-110"
                )} />
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-1 transition-colors duration-200",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
});
