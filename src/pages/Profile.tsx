import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, Trophy, Zap, Flame, Star, Target, Users, Calendar,
  Medal, Crown, Award, TrendingUp, Edit2, Camera, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileKudosSection } from "@/components/ProfileKudosSection";
import { RankingBadge } from "@/components/RankingBadge";
import { CompetencyRadar } from "@/components/CompetencyRadar";
import { useUserRank } from "@/hooks/useUserRank";
import { toast } from "sonner";

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

interface Achievement {
  id: string;
  title: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
}

const mockAchievements: Achievement[] = [
  { id: "1", title: "Primeiro Login", icon: "🎮", rarity: "common", unlocked: true },
  { id: "2", title: "Streak Master", icon: "🔥", rarity: "epic", unlocked: true },
  { id: "3", title: "Top 10", icon: "🏆", rarity: "rare", unlocked: true },
  { id: "4", title: "Quest Hunter", icon: "🎯", rarity: "common", unlocked: true },
  { id: "5", title: "Colaborador", icon: "🤝", rarity: "rare", unlocked: false },
  { id: "6", title: "Lendário", icon: "👑", rarity: "legendary", unlocked: false },
];

const rarityColors = {
  common: "from-muted-foreground/30 to-muted-foreground/10 border-muted-foreground/30",
  rare: "from-secondary/30 to-secondary/10 border-secondary/50",
  epic: "from-accent/30 to-accent/10 border-accent/50",
  legendary: "from-gold/30 to-gold/10 border-gold/50 shadow-[0_0_20px_hsl(var(--gold)/0.3)]",
};

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { data: rankData } = useUserRank();

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
    } catch (err) {
      console.error("Error fetching profile:", err);
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
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
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
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-4xl font-bold shadow-2xl"
                >
                  {profile?.display_name?.charAt(0).toUpperCase() || "?"}
                </motion.div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-card border-4 border-background flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{profile?.level || 1}</span>
                </div>
                {/* Ranking Badge */}
                {rankData?.rank && (
                  <div className="absolute -top-2 -left-2">
                    <RankingBadge rank={rankData.rank} size="md" />
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera className="w-6 h-6" />
                </motion.button>
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

        {/* Achievements */}
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
              {mockAchievements.filter(a => a.unlocked).length}/{mockAchievements.length}
            </span>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {mockAchievements.map((achievement, i) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={achievement.unlocked ? { scale: 1.1, y: -4 } : {}}
                className={`
                  relative p-4 rounded-xl border text-center transition-all duration-200
                  bg-gradient-to-b ${rarityColors[achievement.rarity]}
                  ${!achievement.unlocked ? "opacity-40 grayscale" : ""}
                `}
              >
                <span className="text-2xl">{achievement.icon}</span>
                <p className="text-xs font-medium mt-2 truncate">{achievement.title}</p>
                {!achievement.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs">🔒</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Competency Radar */}
        {user?.id && <CompetencyRadar userId={user.id} />}

        {/* Kudos Received Section */}
        {user?.id && <ProfileKudosSection userId={user.id} />}

        {/* Activity Timeline */}
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
            {[
              { icon: Target, text: "Completou 'Daily Standup'", xp: 50, time: "2h atrás", color: "secondary" },
              { icon: Trophy, text: "Subiu para #4 no ranking", xp: 0, time: "5h atrás", color: "warning" },
              { icon: Award, text: "Desbloqueou 'Top 10'", xp: 100, time: "1 dia atrás", color: "accent" },
              { icon: Users, text: "Participou do desafio Sprint", xp: 200, time: "2 dias atrás", color: "primary" },
            ].map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${activity.color === "secondary" ? "bg-secondary/20 text-secondary" : ""}
                  ${activity.color === "warning" ? "bg-warning/20 text-warning" : ""}
                  ${activity.color === "accent" ? "bg-accent/20 text-accent" : ""}
                  ${activity.color === "primary" ? "bg-primary/20 text-primary" : ""}
                `}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                {activity.xp > 0 && (
                  <span className="text-sm font-semibold text-xp">+{activity.xp} XP</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

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
    </div>
  );
};

export default Profile;
