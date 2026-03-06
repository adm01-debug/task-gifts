import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, Trophy, Zap, Flame, Star, Target, Users, Calendar,
  Medal, Crown, Award, TrendingUp, Edit2, Camera, Heart, Wand2, GraduationCap, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentAuditLogs } from "@/hooks/useAudit";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProfileKudosSection } from "@/components/ProfileKudosSection";
import { RankingBadge } from "@/components/RankingBadge";
import { CompetencyRadar } from "@/components/CompetencyRadar";
import { CertificationsPanel } from "@/components/CertificationsPanel";
import { AvatarCustomizer } from "@/components/AvatarCustomizer";
import { AvatarPreview } from "@/components/AvatarPreview";
import { ProfileAvatarSection } from "@/components/ProfileAvatarSection";
import { logger } from "@/services/loggingService";
import { SoundSettingsCard } from "@/components/SoundSettingsCard";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { MyNineBoxWidget } from "@/components/MyNineBoxWidget";
import { MyDevelopmentPlanWidget } from "@/components/MyDevelopmentPlanWidget";
import { useAvatarConfig } from "@/hooks/useAvatar";
import { useUserRank } from "@/hooks/useUserRank";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { useAllAchievements, useUserAchievements } from "@/hooks/useAchievements";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SEOHead } from "@/components/SEOHead";
import { useSEO } from "@/hooks/useSEO";

interface ProfileData {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  best_streak: number;
  quests_completed: number;
  created_at: string;
}

const rarityColors = {
  common: "from-muted-foreground/30 to-muted-foreground/10 border-muted-foreground/30",
  rare: "from-secondary/30 to-secondary/10 border-secondary/50",
  epic: "from-accent/30 to-accent/10 border-accent/50",
  legendary: "from-gold/30 to-gold/10 border-gold/50 shadow-[0_0_20px_hsl(var(--gold)/0.3)]",
};

// Activity icon and color mapping based on audit action
const activityConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  xp_gained: { icon: Zap, color: "success", label: "Ganhou XP" },
  level_up: { icon: TrendingUp, color: "primary", label: "Subiu de nível" },
  quest_completed: { icon: Target, color: "secondary", label: "Completou quest" },
  achievement_unlocked: { icon: Trophy, color: "warning", label: "Desbloqueou conquista" },
  kudos_received: { icon: Heart, color: "accent", label: "Recebeu kudos" },
  kudos_given: { icon: Heart, color: "primary", label: "Enviou kudos" },
  streak_updated: { icon: Flame, color: "primary", label: "Streak atualizado" },
  coins_earned: { icon: Star, color: "warning", label: "Ganhou moedas" },
  coins_spent: { icon: Star, color: "muted", label: "Gastou moedas" },
};

// ProfileActivityTimeline component using real audit data
const ProfileActivityTimeline = ({ userId }: { userId?: string }) => {
  const { data: auditLogs = [], isLoading } = useRecentAuditLogs(10);
  
  // Filter logs for this user only
  const userLogs = auditLogs.filter(log => log.user_id === userId);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-secondary" />
          Atividade Recente
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (userLogs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-secondary" />
          Atividade Recente
        </h3>
        <p className="text-center text-muted-foreground py-4">
          Nenhuma atividade registrada ainda. Complete quests, ganhe XP e desbloqueie conquistas!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-secondary" />
        Atividade Recente
      </h3>

      <div className="space-y-4">
        {userLogs.slice(0, 5).map((log, i) => {
          const config = activityConfig[log.action] || { 
            icon: Target, 
            color: "muted", 
            label: log.action.replace(/_/g, ' ') 
          };
          const Icon = config.icon;
          const metadata = log.metadata as { xp_amount?: number; description?: string } | null;
          const newData = log.new_data as { xp_amount?: number; level?: number; coins?: number } | null;
          
          // Extract XP from metadata or new_data
          const xpAmount = metadata?.xp_amount || newData?.xp_amount || 0;
          
          // Build activity text
          let activityText = config.label;
          if (log.entity_type && log.entity_type !== 'profile') {
            activityText += ` (${log.entity_type})`;
          }

          const colorClasses: Record<string, string> = {
            success: "bg-success/20 text-success",
            primary: "bg-primary/20 text-primary",
            secondary: "bg-secondary/20 text-secondary",
            warning: "bg-warning/20 text-warning",
            accent: "bg-accent/20 text-accent",
            muted: "bg-muted text-muted-foreground",
          };

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[config.color] || colorClasses.muted}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{activityText}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              {xpAmount > 0 && (
                <span className="text-sm font-semibold text-xp">+{xpAmount} XP</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { data: rankData } = useUserRank();
  const { data: avatarConfig } = useAvatarConfig(user?.id);
  const { data: allAchievements = [], isLoading: achievementsLoading } = useAllAchievements();
  const { data: userAchievements = [] } = useUserAchievements();
  const isScrolled = useScrollHeader(10);
  const seoConfig = useSEO();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data as ProfileData);
      }
    } catch (err: unknown) {
      logger.apiError('Profile load', err, 'Profile');
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoadingProfile(false);
    }
  };

  const xpForNextLevel = (level: number) => level * 500 + 500;
  const currentLevelXP = profile ? profile.xp % xpForNextLevel(profile.level) : 0;
  const xpProgress = profile ? (currentLevelXP / xpForNextLevel(profile.level)) * 100 : 0;

  if (loading || loadingProfile) {
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

  const stats = [
    { icon: Zap, label: "XP Total", value: profile?.xp?.toLocaleString() || "0", color: "success" },
    { icon: Flame, label: "Streak Atual", value: `${profile?.streak || 0} dias`, color: "primary" },
    { icon: Star, label: "Coins", value: profile?.coins?.toLocaleString() || "0", color: "warning" },
    { icon: Target, label: "Quests", value: profile?.quests_completed?.toLocaleString() || "0", color: "secondary" },
  ];


  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} />
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
          style={{
            background: "radial-gradient(circle, hsl(24 95% 55%) 0%, transparent 70%)",
            top: "5%",
            right: "10%",
          }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header 
        className={cn(
          "header-sticky border-b border-border",
          isScrolled && "scrolled"
        )}
      >
        <div className="container max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-xl font-bold">Meu Perfil</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-6 py-8 space-y-8 relative z-10">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="glass rounded-3xl p-8 border border-border">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <AvatarPreview
                  userId={user?.id || ""}
                  userLevel={profile?.level || 1}
                  userStreak={profile?.streak || 0}
                  displayName={profile?.display_name || "Jogador"}
                  size="xl"
                  showEffects={true}
                  onClick={() => setAvatarOpen(true)}
                />
                {/* Ranking Badge */}
                {rankData?.rank && (
                  <div className="absolute -top-2 -left-2">
                    <RankingBadge rank={rankData.rank} size="md" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{profile?.display_name || "Jogador"}</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-1 rounded hover:bg-muted"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                </div>
                <p className="text-muted-foreground mb-4">{profile?.email}</p>

                {/* XP Progress */}
                <div className="max-w-md">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Nível {profile?.level || 1}</span>
                    <span className="text-xp font-semibold">
                      {currentLevelXP.toLocaleString()} / {xpForNextLevel(profile?.level || 1).toLocaleString()} XP
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full xp-bar rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Best Streak Badge */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-streak/20 to-streak/5 border border-streak/30 flex flex-col items-center justify-center glow-primary">
                  <Flame className="w-6 h-6 text-streak streak-fire mb-1" />
                  <span className="text-lg font-bold text-streak">{profile?.best_streak || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Melhor Streak</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`
                p-4 rounded-2xl border border-border bg-card
                ${stat.color === "success" ? "hover:border-success/50" : ""}
                ${stat.color === "primary" ? "hover:border-primary/50" : ""}
                ${stat.color === "warning" ? "hover:border-warning/50" : ""}
                ${stat.color === "secondary" ? "hover:border-secondary/50" : ""}
                transition-all duration-200
              `}
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center mb-3
                ${stat.color === "success" ? "bg-success/20 text-success" : ""}
                ${stat.color === "primary" ? "bg-primary/20 text-primary" : ""}
                ${stat.color === "warning" ? "bg-warning/20 text-warning" : ""}
                ${stat.color === "secondary" ? "bg-secondary/20 text-secondary" : ""}
              `}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Avatar Collection Section */}
        {user?.id && profile && (
          <SectionErrorBoundary sectionName="Coleção de Avatar">
            <ProfileAvatarSection
              userId={user.id}
              userLevel={profile.level}
              userStreak={profile.streak}
              userCoins={profile.coins}
              displayName={profile.display_name || "Jogador"}
            />
          </SectionErrorBoundary>
        )}

        {/* Achievements */}
        <SectionErrorBoundary sectionName="Conquistas">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold" />
                Conquistas
              </h3>
              <span className="text-sm text-muted-foreground">
                {userAchievements.length}/{allAchievements.length}
              </span>
            </div>

            {achievementsLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : allAchievements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma conquista disponível</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {allAchievements.map((achievement, i) => {
                  const isUnlocked = userAchievements.some(ua => ua.achievement_id === achievement.id);
                  const rarity = (achievement.rarity || "common") as keyof typeof rarityColors;
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      whileHover={isUnlocked ? { scale: 1.1, y: -4 } : {}}
                      className={`
                        relative p-4 rounded-xl border text-center transition-all duration-200
                        bg-gradient-to-b ${rarityColors[rarity] || rarityColors.common}
                        ${!isUnlocked ? "opacity-40 grayscale" : ""}
                      `}
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <p className="text-xs font-medium mt-2 truncate">{achievement.name}</p>
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs">🔒</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </SectionErrorBoundary>

        {/* Certifications Panel */}
        <SectionErrorBoundary sectionName="Certificações">
          <CertificationsPanel />
        </SectionErrorBoundary>

        {/* Sound Settings */}
        <SectionErrorBoundary sectionName="Configurações de Som">
          <SoundSettingsCard />
        </SectionErrorBoundary>

        {/* Push Notifications */}
        <SectionErrorBoundary sectionName="Notificações Push">
          <PushNotificationToggle />
        </SectionErrorBoundary>

        {/* Competency Radar */}
        {user?.id && (
          <SectionErrorBoundary sectionName="Radar de Competências">
            <CompetencyRadar userId={user.id} />
          </SectionErrorBoundary>
        )}

        {/* 9-Box Widget */}
        <SectionErrorBoundary sectionName="Avaliação 9-Box">
          <MyNineBoxWidget />
        </SectionErrorBoundary>

        {/* Development Plan Widget */}
        <SectionErrorBoundary sectionName="Plano de Desenvolvimento">
          <MyDevelopmentPlanWidget />
        </SectionErrorBoundary>

        {/* Kudos Received Section */}
        {user?.id && (
          <SectionErrorBoundary sectionName="Kudos Recebidos">
            <ProfileKudosSection userId={user.id} />
          </SectionErrorBoundary>
        )}

        {/* Security Settings - 2FA */}
        <SectionErrorBoundary sectionName="Segurança">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <TwoFactorSetup />
          </motion.div>
        </SectionErrorBoundary>

        {/* Activity Timeline */}
        <SectionErrorBoundary sectionName="Linha do Tempo">
          <ProfileActivityTimeline userId={user?.id} />
        </SectionErrorBoundary>

        {/* Member Since */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Membro desde {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'recentemente'}
        </motion.div>
      </main>

      {/* Avatar Customizer Modal */}
      {user && profile && (
        <AvatarCustomizer
          userId={user.id}
          userLevel={profile.level}
          userStreak={profile.streak}
          userCoins={profile.coins}
          displayName={profile.display_name || "Jogador"}
          open={avatarOpen}
          onClose={() => setAvatarOpen(false)}
        />
      )}
    </div>
  );
};

export default Profile;
