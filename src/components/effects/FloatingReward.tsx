import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingRewardProps {
  isActive: boolean;
  value: string | number;
  type: "xp" | "coins" | "streak";
  position?: { x: number; y: number };
  onComplete?: () => void;
}

const TYPE_CONFIG = {
  xp: {
    icon: "⚡",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    prefix: "+",
    suffix: " XP",
  },
  coins: {
    icon: "🪙",
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    prefix: "+",
    suffix: "",
  },
  streak: {
    icon: "🔥",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    prefix: "",
    suffix: " dias",
  },
};

export function FloatingReward({
  isActive,
  value,
  type,
  position = { x: 50, y: 50 },
  onComplete,
}: FloatingRewardProps) {
  const [show, setShow] = useState(false);
  const config = TYPE_CONFIG[type];

  useEffect(() => {
    if (isActive) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.5,
            x: position.x,
            y: position.y,
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1, 0.8],
            y: position.y - 100,
          }}
          transition={{
            duration: 1.5,
            times: [0, 0.2, 0.8, 1],
            ease: "easeOut",
          }}
          className={`fixed z-50 pointer-events-none flex items-center gap-2 px-4 py-2 rounded-full ${config.bgColor} backdrop-blur-sm border border-white/20 shadow-lg`}
          style={{ left: position.x, top: position.y }}
        >
          <span className="text-2xl">{config.icon}</span>
          <span className={`font-bold text-xl ${config.color}`}>
            {config.prefix}
            {value}
            {config.suffix}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
