import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Zap, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedXPBarProps {
  currentXP: number;
  requiredXP: number;
  level: number;
  className?: string;
  showDetails?: boolean;
  onLevelUp?: (newLevel: number) => void;
}

/**
 * AnimatedXPBar - Gamified XP progress bar with level display
 * Features smooth animations, sparkle effects, and level up celebrations
 */
export function AnimatedXPBar({
  currentXP,
  requiredXP,
  level,
  className,
  showDetails = true,
  onLevelUp,
}: AnimatedXPBarProps) {
  const [displayXP, setDisplayXP] = useState(currentXP);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(level);
  
  const percentage = Math.min((displayXP / requiredXP) * 100, 100);

  // Animate XP changes
  useEffect(() => {
    if (currentXP !== displayXP) {
      setIsAnimating(true);
      const duration = 1000;
      const steps = 30;
      const increment = (currentXP - displayXP) / steps;
      let step = 0;
      
      const timer = setInterval(() => {
        step++;
        if (step >= steps) {
          setDisplayXP(currentXP);
          setIsAnimating(false);
          clearInterval(timer);
        } else {
          setDisplayXP(prev => Math.round(prev + increment));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [currentXP]);

  // Level up detection
  useEffect(() => {
    if (level > prevLevel) {
      setShowLevelUp(true);
      onLevelUp?.(level);
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      setPrevLevel(level);
      return () => clearTimeout(timer);
    }
  }, [level, prevLevel, onLevelUp]);

  return (
    <div className={cn("relative", className)}>
      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span>Level Up!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {/* Level Badge */}
        <motion.div
          animate={showLevelUp ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold text-primary-foreground">{level}</span>
          </div>
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-primary blur-lg -z-10"
            animate={{ opacity: isAnimating ? [0.3, 0.6, 0.3] : 0.2 }}
            transition={{ duration: 1, repeat: isAnimating ? Infinity : 0 }}
          />
        </motion.div>

        {/* Progress Bar */}
        <div className="flex-1">
          {showDetails && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Nível {level}
              </span>
              <div className="flex items-center gap-1 text-xs">
                <Zap className="w-3 h-3 text-primary" />
                <span className="font-semibold text-foreground">
                  {displayXP.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  / {requiredXP.toLocaleString()} XP
                </span>
              </div>
            </div>
          )}

          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
            </div>

            {/* Progress fill */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear",
                  repeatDelay: 1 
                }}
              />
            </motion.div>

            {/* Sparkle particles when animating */}
            <AnimatePresence>
              {isAnimating && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        x: `${percentage}%`, 
                        y: "50%", 
                        scale: 0, 
                        opacity: 1 
                      }}
                      animate={{ 
                        x: `${percentage + 10}%`,
                        y: ["50%", "0%", "100%"][i],
                        scale: [0, 1, 0],
                        opacity: [1, 1, 0]
                      }}
                      transition={{ 
                        duration: 0.6, 
                        delay: i * 0.1,
                        repeat: Infinity 
                      }}
                      className="absolute w-1 h-1 bg-primary-foreground rounded-full"
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>

          {showDetails && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">
                Próximo: Nível {level + 1}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                <span>Faltam {(requiredXP - displayXP).toLocaleString()} XP</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * MiniXPBar - Compact version for headers
 */
export function MiniXPBar({
  currentXP,
  requiredXP,
  level,
  className,
}: Omit<AnimatedXPBarProps, "showDetails" | "onLevelUp">) {
  const percentage = Math.min((currentXP / requiredXP) * 100, 100);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
        <span className="text-xs font-bold text-primary-foreground">{level}</span>
      </div>
      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
