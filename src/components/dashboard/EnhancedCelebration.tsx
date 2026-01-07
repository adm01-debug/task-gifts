import { memo, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Star, Zap, Crown, Flame, Sparkles,
  PartyPopper, Medal, Rocket, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

type CelebrationType = 
  | "level_up" 
  | "achievement" 
  | "streak" 
  | "quest_complete" 
  | "goal_reached"
  | "rank_up"
  | "daily_bonus"
  | "special";

interface CelebrationConfig {
  icon: React.ElementType;
  title: string;
  gradient: string;
  particleColors: string[];
  sound?: string;
}

const celebrationConfigs: Record<CelebrationType, CelebrationConfig> = {
  level_up: {
    icon: Rocket,
    title: "LEVEL UP!",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    particleColors: ["#fbbf24", "#f97316", "#ef4444"],
  },
  achievement: {
    icon: Trophy,
    title: "CONQUISTA!",
    gradient: "from-yellow-400 via-amber-500 to-yellow-600",
    particleColors: ["#facc15", "#f59e0b", "#d97706"],
  },
  streak: {
    icon: Flame,
    title: "SEQUÊNCIA!",
    gradient: "from-orange-500 via-red-500 to-pink-500",
    particleColors: ["#f97316", "#ef4444", "#ec4899"],
  },
  quest_complete: {
    icon: Star,
    title: "MISSÃO COMPLETA!",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    particleColors: ["#34d399", "#14b8a6", "#06b6d4"],
  },
  goal_reached: {
    icon: Medal,
    title: "META ATINGIDA!",
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    particleColors: ["#3b82f6", "#6366f1", "#a855f7"],
  },
  rank_up: {
    icon: Crown,
    title: "RANK UP!",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    particleColors: ["#a855f7", "#ec4899", "#f43f5e"],
  },
  daily_bonus: {
    icon: PartyPopper,
    title: "BÔNUS DIÁRIO!",
    gradient: "from-green-400 via-emerald-500 to-teal-500",
    particleColors: ["#4ade80", "#10b981", "#14b8a6"],
  },
  special: {
    icon: Sparkles,
    title: "ESPECIAL!",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    particleColors: ["#ec4899", "#a855f7", "#6366f1"],
  },
};

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  delay: number;
}

interface EnhancedCelebrationProps {
  isActive: boolean;
  type: CelebrationType;
  title?: string;
  subtitle?: string;
  value?: string | number;
  onComplete?: () => void;
  duration?: number;
}

export const EnhancedCelebration = memo(function EnhancedCelebration({
  isActive,
  type,
  title,
  subtitle,
  value,
  onComplete,
  duration = 3000,
}: EnhancedCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showContent, setShowContent] = useState(false);

  const config = celebrationConfigs[type];
  const Icon = config.icon;

  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const count = 50;

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 12 + 4,
        color: config.particleColors[Math.floor(Math.random() * config.particleColors.length)],
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5,
      });
    }

    setParticles(newParticles);
  }, [config.particleColors]);

  useEffect(() => {
    if (isActive) {
      generateParticles();
      
      // Show content with delay
      const contentTimer = setTimeout(() => setShowContent(true), 200);
      
      // Auto-complete
      const completeTimer = setTimeout(() => {
        setShowContent(false);
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(contentTimer);
        clearTimeout(completeTimer);
      };
    } else {
      setShowContent(false);
      setParticles([]);
    }
  }, [isActive, duration, onComplete, generateParticles]);

  if (!isActive && particles.length === 0) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ 
                  x: "50vw", 
                  y: "50vh",
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: `${particle.x}vw`,
                  y: `${particle.y}vh`,
                  scale: [0, 1, 1, 0],
                  opacity: [0, 1, 1, 0],
                  rotate: particle.rotation,
                }}
                transition={{ 
                  duration: 2,
                  delay: particle.delay,
                  ease: "easeOut"
                }}
                style={{ 
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                }}
                className="absolute rounded-full"
              />
            ))}
          </div>

          {/* Radial glow */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.6, 0.3] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={cn(
              "absolute w-96 h-96 rounded-full blur-3xl",
              `bg-gradient-to-r ${config.gradient}`
            )}
          />

          {/* Main content */}
          <AnimatePresence>
            {showContent && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
                transition={{ 
                  type: "spring",
                  bounce: 0.4,
                  duration: 0.6 
                }}
                className="relative z-10 flex flex-col items-center text-center px-4"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    bounce: 0.5,
                    delay: 0.1 
                  }}
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center mb-6",
                    "bg-gradient-to-br shadow-2xl",
                    config.gradient
                  )}
                >
                  <Icon className="w-12 h-12 text-white drop-shadow-lg" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={cn(
                    "text-4xl md:text-5xl font-black tracking-tight mb-2",
                    "bg-gradient-to-r bg-clip-text text-transparent",
                    config.gradient
                  )}
                >
                  {title || config.title}
                </motion.h2>

                {/* Value */}
                {value && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-6xl md:text-7xl font-black text-white mb-2 drop-shadow-lg"
                  >
                    {value}
                  </motion.div>
                )}

                {/* Subtitle */}
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-white/80 max-w-md"
                  >
                    {subtitle}
                  </motion.p>
                )}

                {/* Sparkles around */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos((i * 60 * Math.PI) / 180) * 120,
                      y: Math.sin((i * 60 * Math.PI) / 180) * 120,
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: 0.3 + i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                    className="absolute"
                  >
                    <Sparkles className={cn("w-6 h-6", config.particleColors[i % 3])} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Hook para usar celebrações
export const useCelebration = () => {
  const [celebration, setCelebration] = useState<{
    isActive: boolean;
    type: CelebrationType;
    title?: string;
    subtitle?: string;
    value?: string | number;
  }>({
    isActive: false,
    type: "achievement",
  });

  const celebrate = useCallback((
    type: CelebrationType,
    options?: { title?: string; subtitle?: string; value?: string | number }
  ) => {
    setCelebration({
      isActive: true,
      type,
      ...options,
    });
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebration(prev => ({ ...prev, isActive: false }));
  }, []);

  return {
    celebration,
    celebrate,
    dismissCelebration,
    CelebrationComponent: (
      <EnhancedCelebration
        {...celebration}
        onComplete={dismissCelebration}
      />
    ),
  };
};
