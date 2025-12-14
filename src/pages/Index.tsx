import { useState, useCallback, memo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { StatsGrid, QuickActions } from "@/components/StatsGrid";
import { AchievementContainer, useAchievements } from "@/components/AchievementSystem";
import { OnboardingWidget } from "@/components/onboarding/OnboardingWidget";
import { SeasonalEventBanner } from "@/components/SeasonalEventBanner";
import { DashboardHeader, DashboardLeftColumn, DashboardRightColumn } from "@/components/dashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useListenToRankChanges } from "@/hooks/useListenToRankChanges";
import { useCompetencyAlerts } from "@/hooks/useCompetencyAlerts";

/**
 * Index - Main Dashboard Page
 * 
 * Architecture Notes:
 * - Auth redirect is handled by ProtectedRoute wrapper in App.tsx
 * - Layout is split into semantic sub-components for maintainability
 * - Below-the-fold widgets use LazyWidget with Intersection Observer
 * - Side-effect hooks are explicitly named for clarity
 */
const Index = memo(function Index() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { achievements, hideAchievement, levelUp, closeLevelUp } = useAchievements();
  const isMobile = useIsMobile();

  // Side-effect listeners - explicitly named for clarity
  useListenToRankChanges();
  useCompetencyAlerts();

  // Memoized handlers
  const handleCloseMobileDrawer = useCallback(() => setMobileDrawerOpen(false), []);
  const handleToggleSidebar = useCallback(() => setSidebarCollapsed(prev => !prev), []);
  
  const handleMenuClick = useCallback(() => {
    if (isMobile) {
      setMobileDrawerOpen(true);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  }, [isMobile]);

  return (
    <PageTransition>
      <div className="min-h-screen flex bg-background">
        {/* Achievement System */}
        <AchievementContainer
          achievements={achievements}
          onHide={hideAchievement}
          levelUp={levelUp}
          onCloseLevelUp={closeLevelUp}
        />

        {/* Mobile Drawer */}
        <MobileDrawer open={mobileDrawerOpen} onClose={handleCloseMobileDrawer} />

        {/* Desktop Sidebar - Hidden on mobile */}
        {!isMobile && (
          <AppSidebar 
            collapsed={sidebarCollapsed} 
            onToggle={handleToggleSidebar} 
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Top Header */}
          <DashboardHeader onMenuClick={handleMenuClick} />

          {/* Dashboard Content */}
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Seasonal Event Banner */}
            <SeasonalEventBanner />
            
            {/* Onboarding Widget */}
            <OnboardingWidget />

            {/* Stats Grid */}
            <section>
              <StatsGrid />
            </section>

            {/* Quick Actions */}
            <section className="flex flex-wrap items-center gap-2 md:gap-4">
              <QuickActions />
            </section>

            {/* Main Grid - Split into semantic columns */}
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
              {/* Left Column - Missions, Quests, Team & Recognition */}
              <DashboardLeftColumn />

              {/* Right Column - Combo, Attendance, Rankings, Leaderboard, Analytics & Rewards */}
              <DashboardRightColumn />
            </div>
          </div>

          {/* Footer */}
          <footer className="px-4 md:px-6 py-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Feito com <span className="text-primary">♥</span> por Task Gifts • 
              <span className="gradient-text font-semibold ml-1">Melhor que o Figma</span>
            </p>
          </footer>
        </main>
      </div>
    </PageTransition>
  );
});

export default Index;
