import { memo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AICoachDialog } from "@/components/AICoachDialog";
import { GlobalSearch } from "@/components/GlobalSearch";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ComboIndicator } from "@/components/ComboIndicator";
import { RankingBadge } from "@/components/RankingBadge";
import { useAuth } from "@/hooks/useAuth";
import { useUserRank } from "@/hooks/useUserRank";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export const DashboardHeader = memo(function DashboardHeader({ 
  onMenuClick 
}: DashboardHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: rankData } = useUserRank();
  const isScrolled = useScrollHeader(10);

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Jogador";

  const handleSignOut = useCallback(async () => {
    await signOut();
    toast.success("Até logo! 👋");
    navigate("/auth");
  }, [signOut, navigate]);

  const handleToggleUserMenu = useCallback(() => setShowUserMenu(prev => !prev), []);
  const handleNavigateToProfile = useCallback(() => navigate("/profile"), [navigate]);

  return (
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
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Abrir menu"
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
          <GlobalSearch />
          <ThemeToggle />
          <NotificationCenter />
          <ComboIndicator variant="compact" />
          <AICoachDialog />

          {/* User Menu */}
          <div className="relative flex items-center gap-2">
            {rankData?.rank && (
              <RankingBadge rank={rankData.rank} size="sm" />
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleUserMenu}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-sm"
              aria-label="Menu do usuário"
            >
              {displayName.charAt(0).toUpperCase()}
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-border">
                    <p className="font-semibold text-sm">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleNavigateToProfile}
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
  );
});
