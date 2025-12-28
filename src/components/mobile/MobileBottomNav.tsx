import { memo, useCallback, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Target, Trophy, User, BookOpen, MoreHorizontal, Gamepad2, BarChart3, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
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
      {/* More menu overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-20 right-3 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              style={{ marginBottom: "max(env(safe-area-inset-bottom), 8px)" }}
            >
              <div className="p-2 grid grid-cols-2 gap-1 min-w-[180px]">
                {moreNavItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-colors",
                        active 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
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
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-background/95 backdrop-blur-xl",
          "border-t border-border/40",
          "shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.15)]",
          className
        )}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {mainNavItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                whileTap={{ scale: 0.85 }}
                className={cn(
                  "relative flex flex-col items-center justify-center",
                  "min-w-[64px] min-h-[52px] px-3 py-2 rounded-2xl",
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
                  "relative z-10 text-[10px] font-medium mt-1 transition-all duration-200",
                  active ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}

          {/* More button */}
          <motion.button
            onClick={toggleMore}
            whileTap={{ scale: 0.85 }}
            className={cn(
              "relative flex flex-col items-center justify-center",
              "min-w-[64px] min-h-[52px] px-3 py-2 rounded-2xl",
              "transition-all duration-200",
              (showMore || isMoreActive)
                ? "text-primary" 
                : "text-muted-foreground active:text-foreground"
            )}
            aria-label="Mais opções"
            aria-expanded={showMore}
          >
            {(showMore || isMoreActive) && (
              <motion.div
                layoutId={isMoreActive && !showMore ? undefined : "bottomNavBg"}
                className="absolute inset-0 bg-primary/10 rounded-2xl"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative z-10">
              <MoreHorizontal className={cn(
                "w-5 h-5 transition-all duration-200",
                (showMore || isMoreActive) && "scale-110"
              )} />
            </div>
            <span className={cn(
              "relative z-10 text-[10px] font-medium mt-1 transition-all duration-200",
              (showMore || isMoreActive) ? "text-primary font-semibold" : "text-muted-foreground"
            )}>
              Mais
            </span>
          </motion.button>
        </div>
      </nav>
    </>
  );
});
