import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, Bell, Search, Sparkles, X, Check, Gift, Trophy, Zap, Clock } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { StatsGrid, QuickActions } from "@/components/StatsGrid";
import { LiveLeaderboard } from "@/components/LiveLeaderboard";
import { DailyQuests } from "@/components/DailyQuests";
import { TeamChallenges } from "@/components/TeamChallenges";
import { RewardsShop } from "@/components/RewardsShop";
import { AnalyticsWidget } from "@/components/AnalyticsWidget";
import { AchievementContainer, useAchievements } from "@/components/AchievementSystem";

// Demo notifications
const notifications = [
  { id: "1", icon: Trophy, title: "Novo ranking!", message: "Você subiu para #4", time: "2min", color: "warning" },
  { id: "2", icon: Zap, title: "+150 XP", message: "Quest completada", time: "5min", color: "success" },
  { id: "3", icon: Gift, title: "Recompensa!", message: "Badge desbloqueado", time: "1h", color: "accent" },
];

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { achievements, showAchievement, hideAchievement, levelUp, triggerLevelUp, closeLevelUp } = useAchievements();

  // Demo: Trigger achievement after 3 seconds
  const triggerDemoAchievement = () => {
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
    triggerLevelUp(43);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Achievement System */}
      <AchievementContainer
        achievements={achievements}
        onHide={hideAchievement}
        levelUp={levelUp}
        onCloseLevelUp={closeLevelUp}
      />

      {/* Sidebar */}
      <AppSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Menu className="w-5 h-5" />
              </motion.button>
              
              <div>
                <h1 className="text-xl font-bold">Bom dia, João! 👋</h1>
                <p className="text-sm text-muted-foreground">
                  Você está no <span className="text-primary font-semibold">#4</span> lugar. Continue assim!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar quests, usuários..."
                  className="bg-transparent text-sm outline-none w-48 placeholder:text-muted-foreground"
                />
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground">
                  ⌘K
                </kbd>
              </motion.div>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
                </motion.button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-border flex items-center justify-between">
                        <h4 className="font-semibold">Notificações</h4>
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="divide-y divide-border max-h-80 overflow-y-auto">
                        {notifications.map((notif, i) => (
                          <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-3 hover:bg-muted/30 transition-colors flex items-start gap-3"
                          >
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center
                              ${notif.color === "warning" ? "bg-warning/20 text-warning" : ""}
                              ${notif.color === "success" ? "bg-success/20 text-success" : ""}
                              ${notif.color === "accent" ? "bg-accent/20 text-accent" : ""}
                            `}>
                              <notif.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{notif.title}</p>
                              <p className="text-xs text-muted-foreground">{notif.message}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {notif.time}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      <div className="p-2 border-t border-border">
                        <button className="w-full py-2 text-sm font-medium text-primary hover:bg-muted/30 rounded-lg transition-colors">
                          Ver todas
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* AI Assistant */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 hover:border-accent/50 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">AI Coach</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <section>
            <StatsGrid />
          </section>

          {/* Quick Actions */}
          <section className="flex flex-wrap items-center gap-4">
            <QuickActions />
            
            {/* Demo buttons */}
            <div className="flex gap-2 ml-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={triggerDemoAchievement}
                className="px-4 py-2 rounded-xl bg-secondary/20 text-secondary text-sm font-medium border border-secondary/30 hover:border-secondary/50 transition-colors"
              >
                🏆 Demo Achievement
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={triggerDemoLevelUp}
                className="px-4 py-2 rounded-xl bg-primary/20 text-primary text-sm font-medium border border-primary/30 hover:border-primary/50 transition-colors"
              >
                ⬆️ Demo Level Up
              </motion.button>
            </div>
          </section>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Quests & Team */}
            <div className="lg:col-span-2 space-y-6">
              <DailyQuests />
              <TeamChallenges />
            </div>

            {/* Right Column - Leaderboard, Analytics & Rewards */}
            <div className="space-y-6">
              <LiveLeaderboard />
              <AnalyticsWidget />
              <RewardsShop />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-border text-center">
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
