import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AICoachDialog } from "@/components/AICoachDialog";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { StatsGrid, QuickActions } from "@/components/StatsGrid";
import { LiveLeaderboard } from "@/components/LiveLeaderboard";
import { DailyQuests } from "@/components/DailyQuests";
import { TeamChallenges } from "@/components/TeamChallenges";
import { RewardsShop } from "@/components/RewardsShop";
import { AnalyticsWidget } from "@/components/AnalyticsWidget";
import { AchievementContainer, useAchievements } from "@/components/AchievementSystem";
import { NotificationCenter } from "@/components/NotificationCenter";
import { PeerRecognition } from "@/components/PeerRecognition";
import { KudosRanking } from "@/components/KudosRanking";
import DepartmentMissions from "@/components/DepartmentMissions";
import DepartmentRankings from "@/components/DepartmentRankings";
import { AttendanceModule } from "@/components/AttendanceModule";
import { OnboardingWidget } from "@/components/onboarding/OnboardingWidget";
import { ComboIndicator } from "@/components/ComboIndicator";
import { ComboHistory } from "@/components/ComboHistory";
import { WeeklyPerformanceComparison } from "@/components/WeeklyPerformanceComparison";
import { SocialFeed } from "@/components/SocialFeed";
import { RankingBadge } from "@/components/RankingBadge";
import { WeeklyChallengeCard } from "@/components/WeeklyChallengeCard";
import { SeasonalEventBanner } from "@/components/SeasonalEventBanner";
import { StaggeredContainer, StaggeredItem, StaggeredItemLeft, StaggeredItemRight } from "@/components/StaggeredContainer";
import { useAuth } from "@/hooks/useAuth";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserRank } from "@/hooks/useUserRank";
import { useRankChangeNotifier } from "@/hooks/useRankChangeNotifier";
import { useCompetencyAlerts } from "@/hooks/useCompetencyAlerts";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { achievements, showAchievement, hideAchievement, levelUp, triggerLevelUp, closeLevelUp } = useAchievements();
  const { user, loading, signOut } = useAuth();
  const { playAchievementSound, playLevelUpSound } = useSoundEffects();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { data: rankData } = useUserRank();
  const isScrolled = useScrollHeader(10);
  // Track rank changes and notify user
  useRankChangeNotifier();
  
  // Auto-trigger competency analysis for alerts
  useCompetencyAlerts();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo! 👋");
    navigate("/auth");
  };

  const triggerDemoAchievement = () => {
    playAchievementSound();
    showAchievement({
      id: Date.now().toString(),
      title: "Primeiro Passo!",
      description: "Você explorou o dashboard",
      icon: "trophy",
      xp: 100,
      rarity: "rare",
    });
  };

  const triggerDemoLevelUp = () => {
    playLevelUpSound();
    triggerLevelUp(43);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    );
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Jogador";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Achievement System */}
      <AchievementContainer
        achievements={achievements}
        onHide={hideAchievement}
        levelUp={levelUp}
        onCloseLevelUp={closeLevelUp}
      />

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />

      {/* Desktop Sidebar - Hidden on mobile */}
      {!isMobile && (
        <AppSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Header with Progressive Shadow */}
        <header 
          className={cn(
            "header-sticky border-b border-border",
            isScrolled && "scrolled"
          )}
        >
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex items-center gap-3 md:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => isMobile ? setMobileDrawerOpen(true) : setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Menu className="w-5 h-5" />
              </motion.button>
              
              <div>
                <h1 className="text-lg md:text-xl font-bold">Olá, {displayName}! 👋</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  {rankData?.rank ? (
                    <>Você está no <span className="text-primary font-semibold">#{rankData.rank}</span> lugar. Continue assim!</>
                  ) : (
                    <>Complete atividades para subir no ranking!</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <NotificationCenter />

              {/* Combo Indicator */}
              <ComboIndicator variant="compact" />

              {/* AI Coach */}
              <AICoachDialog />

              {/* User Menu */}
              <div className="relative flex items-center gap-2">
                {/* Ranking Badge */}
                {rankData?.rank && (
                  <RankingBadge rank={rankData.rank} size="sm" />
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-sm"
                >
                  {displayName.charAt(0).toUpperCase()}
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-12 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-border">
                        <p className="font-semibold text-sm">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => navigate("/profile")}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                        >
                          <User className="w-4 h-4" />
                          Meu Perfil
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

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
            
            {/* Demo buttons */}
            <div className="flex gap-2 ml-auto flex-wrap justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={triggerDemoAchievement}
                className="px-3 md:px-4 py-2 rounded-xl bg-secondary/20 text-secondary text-xs md:text-sm font-medium border border-secondary/30 hover:border-secondary/50 transition-colors"
              >
                🏆 Achievement
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={triggerDemoLevelUp}
                className="px-3 md:px-4 py-2 rounded-xl bg-primary/20 text-primary text-xs md:text-sm font-medium border border-primary/30 hover:border-primary/50 transition-colors"
              >
                ⬆️ Level Up
              </motion.button>
            </div>
          </section>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - Missions, Quests, Team & Recognition */}
            <StaggeredContainer 
              className="lg:col-span-2 space-y-4 md:space-y-6"
              staggerDelay={0.12}
              initialDelay={0.1}
            >
              <StaggeredItemLeft><SocialFeed limit={20} /></StaggeredItemLeft>
              <StaggeredItemLeft><DepartmentMissions /></StaggeredItemLeft>
              <StaggeredItemLeft><DailyQuests /></StaggeredItemLeft>
              <StaggeredItemLeft><PeerRecognition /></StaggeredItemLeft>
              <StaggeredItemLeft><TeamChallenges /></StaggeredItemLeft>
            </StaggeredContainer>

            {/* Right Column - Combo, Attendance, Rankings, Leaderboard, Kudos, Analytics & Rewards */}
            <StaggeredContainer 
              className="space-y-4 md:space-y-6"
              staggerDelay={0.1}
              initialDelay={0.2}
            >
              <StaggeredItemRight><WeeklyChallengeCard /></StaggeredItemRight>
              <StaggeredItemRight><ComboIndicator variant="full" /></StaggeredItemRight>
              <StaggeredItemRight><ComboHistory /></StaggeredItemRight>
              <StaggeredItemRight><WeeklyPerformanceComparison /></StaggeredItemRight>
              <StaggeredItemRight><AttendanceModule /></StaggeredItemRight>
              <StaggeredItemRight><DepartmentRankings /></StaggeredItemRight>
              <StaggeredItemRight><LiveLeaderboard /></StaggeredItemRight>
              <StaggeredItemRight><KudosRanking /></StaggeredItemRight>
              <StaggeredItemRight><AnalyticsWidget /></StaggeredItemRight>
              <StaggeredItemRight><RewardsShop /></StaggeredItemRight>
            </StaggeredContainer>
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
  );
};

export default Index;
