import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Coins, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedCoinBalanceProps {
  balance: number;
  className?: string;
  variant?: "default" | "compact" | "large";
  showChange?: boolean;
}

/**
 * AnimatedCoinBalance - Animated coin display with count-up effect
 * Features floating +/- indicators and sparkle effects
 */
export function AnimatedCoinBalance({
  balance,
  className,
  variant = "default",
  showChange = true,
}: AnimatedCoinBalanceProps) {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [change, setChange] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevBalance = useRef(balance);

  // Animate balance changes
  useEffect(() => {
    if (balance !== prevBalance.current) {
      const diff = balance - prevBalance.current;
      if (showChange) {
        setChange(diff);
        setTimeout(() => setChange(null), 2000);
      }
      
      setIsAnimating(true);
      const duration = 800;
      const steps = 20;
      const increment = diff / steps;
      let step = 0;
      
      const timer = setInterval(() => {
        step++;
        if (step >= steps) {
          setDisplayBalance(balance);
          setIsAnimating(false);
          clearInterval(timer);
        } else {
          setDisplayBalance(prev => Math.round(prev + increment));
        }
      }, duration / steps);
      
      prevBalance.current = balance;
      return () => clearInterval(timer);
    }
  }, [balance, showChange]);

  if (variant === "compact") {
    return (
      <motion.div
        className={cn(
          "relative flex items-center gap-1.5 px-2.5 py-1 rounded-full",
          "bg-amber-500/10 border border-amber-500/20",
          className
        )}
        animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={isAnimating ? { rotate: [0, 360] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Coins className="w-4 h-4 text-amber-500" />
        </motion.div>
        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
          {displayBalance.toLocaleString()}
        </span>

        {/* Change indicator */}
        <AnimatePresence>
          {change !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: 0 }}
              animate={{ opacity: 1, y: -20, x: 10 }}
              exit={{ opacity: 0, y: -30 }}
              className={cn(
                "absolute -top-1 right-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold",
                change > 0 
                  ? "bg-green-500/20 text-green-600" 
                  : "bg-red-500/20 text-red-600"
              )}
            >
              {change > 0 ? "+" : ""}{change}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (variant === "large") {
    return (
      <motion.div
        className={cn("relative", className)}
        animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
      >
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          {/* Coin icon with animation */}
          <motion.div
            className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
            animate={isAnimating ? { 
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 0.6 }}
          >
            <Coins className="w-8 h-8 text-white" />
            
            {/* Sparkles */}
            <AnimatePresence>
              {isAnimating && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ 
                        scale: [0, 1, 0],
                        opacity: [1, 1, 0],
                        x: [0, (i % 2 === 0 ? 30 : -30)],
                        y: [0, (i < 2 ? -30 : 30)]
                      }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="absolute"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Saldo de Moedas</p>
            <div className="flex items-baseline gap-2">
              <motion.span
                key={displayBalance}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-amber-600 dark:text-amber-400"
              >
                {displayBalance.toLocaleString()}
              </motion.span>
              <span className="text-sm text-muted-foreground">coins</span>
            </div>
            
            {/* Change indicator */}
            <AnimatePresence>
              {change !== null && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "flex items-center gap-1 mt-1 text-sm font-medium",
                    change > 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {change > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{change > 0 ? "+" : ""}{change} moedas</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-xl",
        "bg-gradient-to-r from-amber-500/10 to-orange-500/10",
        "border border-amber-500/20",
        className
      )}
      animate={isAnimating ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
        animate={isAnimating ? { rotate: [0, 360] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Coins className="w-4 h-4 text-white" />
      </motion.div>
      
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Moedas</p>
        <motion.p
          key={displayBalance}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg font-bold text-amber-600 dark:text-amber-400 leading-none"
        >
          {displayBalance.toLocaleString()}
        </motion.p>
      </div>

      {/* Floating change indicator */}
      <AnimatePresence>
        {change !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -25, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.5 }}
            className={cn(
              "absolute top-0 right-2 flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-bold shadow-lg",
              change > 0 
                ? "bg-green-500 text-white" 
                : "bg-red-500 text-white"
            )}
          >
            {change > 0 ? "+" : ""}{change}
            <Coins className="w-3 h-3" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
