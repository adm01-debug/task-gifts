// Core & Libs
import { useState, useCallback, useEffect } from "react";

// Components
import { PageTransition } from "@/components/PageTransition";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { StatsGrid, QuickActions } from "@/components/StatsGrid";
import { AchievementContainer, useAchievements } from "@/components/AchievementSystem";
import { OnboardingWidget } from "@/components/onboarding/OnboardingWidget";
import { SeasonalEventBanner } from "@/components/SeasonalEventBanner";
import { DashboardHeader, DashboardLeftColumn, DashboardRightColumn, DashboardFooter } from "@/components/dashboard";

// Hooks
import { useIsMobileWithHydration } from "@/hooks/use-mobile";
import { useListenToRankChanges } from "@/hooks/useListenToRankChanges";
import { useCompetencyAlerts } from "@/hooks/useCompetencyAlerts";

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

/**
 * Index - Main Dashboard Page
 * 
 * Architecture Notes:
 * - Auth redirect is handled by ProtectedRoute wrapper in App.tsx
 * - Layout is split into semantic sub-components for maintainability
 * - Below-the-fold widgets use LazyWidget with Intersection Observer
 * - Side-effect hooks are explicitly named for clarity
 * - Sidebar state persists in localStorage
 */
function Index() {
  // Persist sidebar state in localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Defensive defaults for useAchievements
  const { 
    achievements = [], 
    hideAchievement = () => {}, 
    levelUp = null, 
    closeLevelUp = () => {} 
  } = useAchievements() ?? {};
  
  // Use hydration-aware mobile detection to prevent layout shift
  const { isMobile, isHydrated } = useIsMobileWithHydration();

  // Side-effect listeners - explicitly named for clarity
  useListenToRankChanges();
  useCompetencyAlerts();

  // Persist sidebar state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
    } catch {
      // Ignore localStorage errors (e.g., private browsing)
    }
  }, [sidebarCollapsed]);

  // Close mobile drawer when switching to desktop viewport
  useEffect(() => {
    if (!isMobile && mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  }, [isMobile, mobileDrawerOpen]);

  // Memoized handlers
  const handleCloseMobileDrawer = useCallback(() => setMobileDrawerOpen(false), []);
  const handleToggleSidebar = useCallback(() => setSidebarCollapsed(prev => !prev), []);
  
  // Unified menu click - reuses handleToggleSidebar to avoid duplication
  const handleMenuClick = useCallback(() => {
    if (isMobile) {
      setMobileDrawerOpen(true);
    } else {
      handleToggleSidebar();
    }
  }, [isMobile, handleToggleSidebar]);

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

        {/* Desktop Sidebar - Hidden on mobile, waits for hydration to prevent layout shift */}
        {isHydrated && !isMobile && (
          <AppSidebar 
            collapsed={sidebarCollapsed} 
            onToggle={handleToggleSidebar} 
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto" role="main" aria-label="Dashboard principal">
          {/* Top Header */}
          <DashboardHeader onMenuClick={handleMenuClick} />

          {/* Dashboard Content */}
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Seasonal Event Banner */}
            <SeasonalEventBanner />
            
            {/* Onboarding Widget */}
            <OnboardingWidget />

            {/* Stats Grid */}
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">Estatísticas do usuário</h2>
              <StatsGrid />
            </section>

            {/* Quick Actions */}
            <section className="flex flex-wrap items-center gap-2 md:gap-4" aria-label="Ações rápidas">
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
          <DashboardFooter />
        </main>
      </div>
    </PageTransition>
  );
}

export default Index;
