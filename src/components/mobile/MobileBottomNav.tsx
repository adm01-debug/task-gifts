import { memo, useCallback, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Target, Trophy, User, BookOpen, MoreHorizontal, Gamepad2, BarChart3, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Target, label: "Metas", path: "/goals" },
  { icon: Trophy, label: "Ligas", path: "/leagues" },
  { icon: BookOpen, label: "Trilhas", path: "/trails" },
];

const moreNavItems: NavItem[] = [
  { icon: Gamepad2, label: "Duelos", path: "/duels" },
  { icon: BarChart3, label: "Stats", path: "/personal-stats" },
  { icon: MessageSquare, label: "Feed", path: "/social-feed" },
  { icon: User, label: "Perfil", path: "/profile" },
];

interface MobileBottomNavProps {
  className?: string;
}

export const MobileBottomNav = memo(function MobileBottomNav({ className }: MobileBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const haptic = useHapticFeedback();
  const [showMore, setShowMore] = useState(false);

  // Close more menu when route changes
  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const handleNavClick = useCallback((path: string) => {
    haptic.buttonPress();
    navigate(path);
    setShowMore(false);
  }, [navigate, haptic]);

  const toggleMore = useCallback(() => {
    haptic.buttonPress();
    setShowMore(prev => !prev);
  }, [haptic]);

  const isActive = useCallback((path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const isMoreActive = moreNavItems.some(item => isActive(item.path));

  return (
    <>
      {/* More menu - slides up from bottom */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
              
              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3">
                <h3 className="text-sm font-semibold text-foreground">Mais opções</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMore(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              </div>
              
              {/* Grid of options */}
              <div className="px-4 pb-4 grid grid-cols-4 gap-2">
                {moreNavItems.map((item, index) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNavClick(item.path)}
                      whileTap={{ scale: 0.92 }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all",
                        active 
                          ? "bg-primary text-primary-foreground shadow-lg" 
                          : "bg-muted/50 text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className={cn("w-6 h-6", active && "scale-110")} />
                      <span className="text-xs font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main bottom nav */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30",
          "bg-background/98 backdrop-blur-xl",
          "border-t border-border/30",
          "shadow-[0_-2px_20px_-4px_rgba(0,0,0,0.1)]",
          showMore && "pointer-events-none opacity-0",
          className
        )}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <div className="flex items-center justify-around h-[60px] px-1">
          {mainNavItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                whileTap={{ scale: 0.88 }}
                className={cn(
                  "relative flex flex-col items-center justify-center",
                  "min-w-[60px] min-h-[48px] px-2 py-1.5 rounded-xl",
                  "transition-all duration-200"
                )}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-x-3 -top-1.5 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <motion.div 
                  className="relative z-10"
                  animate={{ 
                    y: active ? -2 : 0,
                    scale: active ? 1.1 : 1 
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon className={cn(
                    "w-[22px] h-[22px] transition-colors duration-200",
                    active ? "text-primary" : "text-muted-foreground"
                  )} />
                </motion.div>
                <motion.span 
                  className={cn(
                    "relative z-10 text-[10px] font-medium mt-0.5 transition-colors duration-200",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                  animate={{ opacity: active ? 1 : 0.8 }}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}

          {/* More button */}
          <motion.button
            onClick={toggleMore}
            whileTap={{ scale: 0.88 }}
            className={cn(
              "relative flex flex-col items-center justify-center",
              "min-w-[60px] min-h-[48px] px-2 py-1.5 rounded-xl",
              "transition-all duration-200"
            )}
            aria-label="Mais opções"
            aria-expanded={showMore}
          >
            {isMoreActive && (
              <motion.div
                className="absolute inset-x-3 -top-1.5 h-1 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <motion.div 
              className="relative z-10"
              animate={{ 
                y: isMoreActive ? -2 : 0,
                scale: isMoreActive ? 1.1 : 1,
                rotate: showMore ? 90 : 0
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <MoreHorizontal className={cn(
                "w-[22px] h-[22px] transition-colors duration-200",
                isMoreActive ? "text-primary" : "text-muted-foreground"
              )} />
            </motion.div>
            <motion.span 
              className={cn(
                "relative z-10 text-[10px] font-medium mt-0.5 transition-colors duration-200",
                isMoreActive ? "text-primary" : "text-muted-foreground"
              )}
              animate={{ opacity: isMoreActive ? 1 : 0.8 }}
            >
              Mais
            </motion.span>
          </motion.button>
        </div>
      </nav>
    </>
  );
});
