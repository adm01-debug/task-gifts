import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Trophy, Zap, Star, Flame, Award, PartyPopper } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "trophy" | "zap" | "star" | "flame" | "award";
  xp: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const iconMap = {
  trophy: Trophy,
  zap: Zap,
  star: Star,
  flame: Flame,
  award: Award,
};

const rarityColors = {
  common: "from-muted-foreground/50 to-muted-foreground/30",
  rare: "from-secondary to-secondary/60",
  epic: "from-accent to-accent/60",
  legendary: "from-gold via-warning to-gold",
};

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementToast = ({ achievement, onClose }: AchievementToastProps) => {
  const Icon = iconMap[achievement.icon];

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
    >
      {/* Animated background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${rarityColors[achievement.rarity]} opacity-20`}
        animate={{ 
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Particles */}
      {achievement.rarity === "legendary" && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold"
              initial={{ 
                x: 150, 
                y: 50,
                scale: 0,
              }}
              animate={{ 
                x: Math.random() * 300,
                y: Math.random() * 100,
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ 
                duration: 1.5,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 p-4 flex items-center gap-4">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
          className={`
            w-14 h-14 rounded-xl flex items-center justify-center
            bg-gradient-to-br ${rarityColors[achievement.rarity]}
            ${achievement.rarity === "legendary" ? "shadow-[0_0_30px_hsl(var(--gold)/0.5)]" : ""}
          `}
        >
          <Icon className="w-7 h-7 text-primary-foreground" />
        </motion.div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-1"
          >
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Conquista Desbloqueada!
            </span>
            <PartyPopper className="w-4 h-4 text-warning" />
          </motion.div>
          
          <motion.h4
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-bold text-lg"
          >
            {achievement.title}
          </motion.h4>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground"
          >
            {achievement.description}
          </motion.p>
        </div>

        {/* XP Reward */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-xp/20">
            <Zap className="w-4 h-4 text-xp" />
            <span className="font-bold text-xp">+{achievement.xp}</span>
          </div>
        </motion.div>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 5, ease: "linear" }}
        className="h-1 bg-primary origin-left"
      />
    </motion.div>
  );
};

// Level Up Animation Component
interface LevelUpProps {
  newLevel: number;
  onClose: () => void;
}

export const LevelUpCelebration = ({ newLevel, onClose }: LevelUpProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Radial burst */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 3, opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.5 }}
        className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
      />

      {/* Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: i % 3 === 0 ? "hsl(var(--primary))" : i % 3 === 1 ? "hsl(var(--secondary))" : "hsl(var(--gold))",
          }}
          initial={{ x: 0, y: 0, scale: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            scale: [0, 1, 0],
          }}
          transition={{ duration: 1.5, delay: i * 0.05 }}
        />
      ))}

      {/* Main content */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative text-center"
      >
        <motion.div
          animate={{ 
            boxShadow: [
              "0 0 20px hsl(var(--primary) / 0.3)",
              "0 0 60px hsl(var(--primary) / 0.6)",
              "0 0 20px hsl(var(--primary) / 0.3)",
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary via-secondary to-accent mb-6"
        >
          <span className="text-5xl font-black text-primary-foreground">{newLevel}</span>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-black gradient-text mb-2"
        >
          LEVEL UP!
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground"
        >
          Você chegou ao nível {newLevel}!
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

// Hook to manage achievements
export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  const showAchievement = useCallback((achievement: Achievement) => {
    setAchievements(prev => [...prev, achievement]);
  }, []);

  const hideAchievement = useCallback((id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  }, []);

  const triggerLevelUp = useCallback((level: number) => {
    setLevelUp(level);
  }, []);

  const closeLevelUp = useCallback(() => {
    setLevelUp(null);
  }, []);

  return { achievements, showAchievement, hideAchievement, levelUp, triggerLevelUp, closeLevelUp };
};

// Container component
interface AchievementContainerProps {
  achievements: Achievement[];
  onHide: (id: string) => void;
  levelUp: number | null;
  onCloseLevelUp: () => void;
}

export const AchievementContainer = ({ achievements, onHide, levelUp, onCloseLevelUp }: AchievementContainerProps) => {
  return (
    <>
      {/* Achievement toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-3 w-96">
        <AnimatePresence>
          {achievements.map(achievement => (
            <AchievementToast
              key={achievement.id}
              achievement={achievement}
              onClose={() => onHide(achievement.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Level up overlay */}
      <AnimatePresence>
        {levelUp && (
          <LevelUpCelebration newLevel={levelUp} onClose={onCloseLevelUp} />
        )}
      </AnimatePresence>
    </>
  );
};
