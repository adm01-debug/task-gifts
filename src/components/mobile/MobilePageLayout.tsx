import { memo, ReactNode, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { MobileBottomNav } from "./MobileBottomNav";
import { ScrollToTopFAB } from "./ScrollToTopFAB";

interface MobilePageLayoutProps {
  children: ReactNode;
  title: string;
  icon?: LucideIcon;
  /** Custom header background gradient */
  headerGradient?: string;
  /** Show back button (default: true) */
  showBackButton?: boolean;
  /** Custom back path (default: navigate(-1)) */
  backPath?: string;
  /** Right side actions */
  headerActions?: ReactNode;
  /** Additional className for main content */
  className?: string;
  /** Hide bottom navigation */
  hideBottomNav?: boolean;
  /** Subtitle text */
  subtitle?: string;
  /** Enable swipe-back gesture */
  enableSwipeBack?: boolean;
}

/**
 * MobilePageLayout - Consistent mobile layout wrapper
 * Ensures every page has proper navigation on mobile
 */
export const MobilePageLayout = memo(function MobilePageLayout({
  children,
  title,
  icon: Icon,
  headerGradient,
  showBackButton = true,
  backPath,
  headerActions,
  className,
  hideBottomNav = false,
  subtitle,
  enableSwipeBack = true,
}: MobilePageLayoutProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isScrolled = useScrollHeader(10);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  // Swipe-back gesture support
  const { isSwiping, progress } = useSwipeBack({
    onNavigate: handleBack,
    disabled: !enableSwipeBack || !showBackButton,
  });

  // On desktop, just render children with minimal wrapper
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-background pb-20"
    >
      {/* Swipe back indicator */}
      <AnimatePresence>
        {isSwiping && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: progress, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-2 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-primary-foreground" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page overlay during swipe */}
      {isSwiping && (
        <motion.div
          className="fixed inset-0 bg-black/5 z-30 pointer-events-none"
          style={{ opacity: progress * 0.5 }}
        />
      )}

      {/* Sticky Header */}
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-200",
          headerGradient || "bg-background/95 backdrop-blur-xl",
          isScrolled && "shadow-sm border-b border-border/30",
          headerGradient && "text-white"
        )}
      >
        <div className="flex items-center justify-between h-14 px-3">
          {/* Left: Back button */}
          <div className="flex items-center gap-2">
            {showBackButton ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBack}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
                  headerGradient 
                    ? "hover:bg-white/20 active:bg-white/30" 
                    : "hover:bg-muted active:bg-muted/80"
                )}
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            ) : (
              <div className="w-10" />
            )}
            
            {/* Title with optional icon */}
            <div className="flex items-center gap-2">
              {Icon && (
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  headerGradient 
                    ? "bg-white/20" 
                    : "bg-primary/10"
                )}>
                  <Icon className={cn(
                    "w-4 h-4",
                    headerGradient ? "text-white" : "text-primary"
                  )} />
                </div>
              )}
              <div>
                <motion.h1 
                  className="font-semibold text-base truncate max-w-[180px]"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {title}
                </motion.h1>
                {subtitle && (
                  <p className={cn(
                    "text-xs truncate max-w-[180px]",
                    headerGradient ? "text-white/70" : "text-muted-foreground"
                  )}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Custom actions */}
          <div className="flex items-center gap-1">
            {headerActions}
          </div>
        </div>
      </header>

      {/* Main Content with swipe transform */}
      <motion.main 
        className={cn("relative", className)}
        style={{
          transform: isSwiping ? `translateX(${progress * 30}px)` : 'translateX(0)',
          transition: isSwiping ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </motion.main>

      {/* Bottom Navigation */}
      {!hideBottomNav && <MobileBottomNav />}
      
      {/* Scroll to top FAB */}
      <ScrollToTopFAB />
    </div>
  );
});

export default MobilePageLayout;
