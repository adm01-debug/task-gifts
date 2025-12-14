import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface SuccessCelebrationProps {
  isActive: boolean;
  message?: string;
  subMessage?: string;
  type?: "xp" | "level" | "achievement" | "quest" | "streak";
  value?: string | number;
  onComplete?: () => void;
}

const TYPE_CONFIG = {
  xp: {
    icon: "⚡",
    color: "from-blue-400 to-cyan-400",
    glowColor: "shadow-blue-500/50",
    confettiColors: ["#3b82f6", "#06b6d4", "#22d3ee"],
  },
  level: {
    icon: "🎖️",
    color: "from-amber-400 to-yellow-500",
    glowColor: "shadow-amber-500/50",
    confettiColors: ["#f59e0b", "#eab308", "#fbbf24"],
  },
  achievement: {
    icon: "🏆",
    color: "from-purple-400 to-pink-500",
    glowColor: "shadow-purple-500/50",
    confettiColors: ["#a855f7", "#ec4899", "#d946ef"],
  },
  quest: {
    icon: "✅",
    color: "from-green-400 to-emerald-500",
    glowColor: "shadow-green-500/50",
    confettiColors: ["#22c55e", "#10b981", "#34d399"],
  },
  streak: {
    icon: "🔥",
    color: "from-orange-400 to-red-500",
    glowColor: "shadow-orange-500/50",
    confettiColors: ["#f97316", "#ef4444", "#fb923c"],
  },
};

export function SuccessCelebration({
  isActive,
  message = "Parabéns!",
  subMessage,
  type = "achievement",
  value,
  onComplete,
}: SuccessCelebrationProps) {
  const [show, setShow] = useState(false);
  const config = TYPE_CONFIG[type];

  useEffect(() => {
    if (isActive) {
      setShow(true);

      // Fire confetti
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: config.confettiColors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: config.confettiColors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Big burst in center
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: config.confettiColors,
      });

      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isActive, config.confettiColors, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Glowing icon */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: 3,
                repeatType: "reverse",
              }}
              className={`text-7xl mb-4 drop-shadow-2xl ${config.glowColor}`}
            >
              {config.icon}
            </motion.div>

            {/* Value badge */}
            {value && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`px-6 py-2 rounded-full bg-gradient-to-r ${config.color} text-white font-bold text-2xl shadow-lg mb-3`}
              >
                {type === "xp" ? `+${value} XP` : value}
              </motion.div>
            )}

            {/* Message */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-display font-bold text-white text-center drop-shadow-lg"
            >
              {message}
            </motion.h2>

            {/* Sub message */}
            {subMessage && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-white/80 text-center mt-2"
              >
                {subMessage}
              </motion.p>
            )}

            {/* Decorative rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5 + i * 0.5, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className={`absolute w-32 h-32 rounded-full border-2 bg-gradient-to-r ${config.color} opacity-30`}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
