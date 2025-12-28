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
  { icon: Trophy, label: "Ligas", path: "/leagues" },
  { icon: BookOpen, label: "Trilhas", path: "/trails" },
  { icon: User, label: "Eu", path: "/profile" },
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
        "bg-background/95 backdrop-blur-xl",
        "border-t border-border/40",
        "shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]",
        className
      )}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              whileTap={{ scale: 0.85 }}
              className={cn(
                "relative flex flex-col items-center justify-center",
                "min-w-[60px] min-h-[48px] px-2 py-1.5 rounded-2xl",
                "transition-all duration-200",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground active:text-foreground"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.div
                  layoutId="bottomNavBg"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-200",
                  active && "scale-110"
                )} />
              </div>
              <span className={cn(
                "relative z-10 text-[10px] font-medium mt-0.5 transition-all duration-200",
                active ? "text-primary font-semibold" : "text-muted-foreground"
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
