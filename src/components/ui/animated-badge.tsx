import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBadgeProps {
  count: number;
  max?: number;
  className?: string;
  showZero?: boolean;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

export const AnimatedBadge = memo(function AnimatedBadge({
  count,
  max = 99,
  className,
  showZero = false,
  pulse = true,
  size = "md",
}: AnimatedBadgeProps) {
  const [prevCount, setPrevCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (count !== prevCount) {
      setIsAnimating(true);
      setPrevCount(count);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [count, prevCount]);

  if (count === 0 && !showZero) return null;

  const displayValue = count > max ? `${max}+` : count.toString();

  const sizeClasses = {
    sm: "min-w-[16px] h-4 text-[10px] px-1",
    md: "min-w-[20px] h-5 text-[11px] px-1.5",
    lg: "min-w-[24px] h-6 text-xs px-2",
  };

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={count}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isAnimating ? [1, 1.3, 1] : 1, 
          opacity: 1 
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 25 
        }}
        className={cn(
          "inline-flex items-center justify-center font-bold rounded-full",
          "bg-destructive text-destructive-foreground",
          sizeClasses[size],
          pulse && count > 0 && "animate-pulse",
          className
        )}
      >
        {displayValue}
        
        {/* Ripple effect on change */}
        {isAnimating && (
          <motion.span
            className="absolute inset-0 rounded-full bg-destructive"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </motion.span>
    </AnimatePresence>
  );
});

// Dot variant for simpler notifications
interface NotificationDotProps {
  visible: boolean;
  className?: string;
  pulse?: boolean;
}

export const NotificationDot = memo(function NotificationDot({
  visible,
  className,
  pulse = true,
}: NotificationDotProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className={cn(
            "absolute -top-1 -right-1 w-3 h-3 rounded-full bg-destructive",
            pulse && "animate-pulse",
            className
          )}
        >
          {/* Outer ring animation */}
          <motion.span
            className="absolute inset-0 rounded-full bg-destructive"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.span>
      )}
    </AnimatePresence>
  );
});
