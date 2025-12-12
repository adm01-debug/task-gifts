import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, Bell, Search, Sparkles } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { StatsGrid, QuickActions } from "@/components/StatsGrid";
import { LiveLeaderboard } from "@/components/LiveLeaderboard";
import { DailyQuests } from "@/components/DailyQuests";
import { TeamChallenges } from "@/components/TeamChallenges";
import { RewardsShop } from "@/components/RewardsShop";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
              </motion.button>

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
          <section>
            <QuickActions />
          </section>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Quests */}
            <div className="lg:col-span-2 space-y-6">
              <DailyQuests />
              <TeamChallenges />
            </div>

            {/* Right Column - Leaderboard & Rewards */}
            <div className="space-y-6">
              <LiveLeaderboard />
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
