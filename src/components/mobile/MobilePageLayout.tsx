import { memo, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Menu, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollHeader } from "@/hooks/useScrollHeader";
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
}: MobilePageLayoutProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isScrolled = useScrollHeader(10);

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  // On desktop, just render children with minimal wrapper
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-200",
          headerGradient || "bg-background/95 backdrop-blur-xl",
          isScrolled && "shadow-md",
          headerGradient && "text-white"
        )}
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Back button or Menu */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBack}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
                  headerGradient 
                    ? "hover:bg-white/20" 
                    : "hover:bg-muted"
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
                <h1 className="font-semibold text-base truncate max-w-[180px]">
                  {title}
                </h1>
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
          <div className="flex items-center gap-2">
            {headerActions}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("relative", className)}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideBottomNav && <MobileBottomNav />}
      
      {/* Scroll to top FAB */}
      <ScrollToTopFAB />
    </div>
  );
});

export default MobilePageLayout;
