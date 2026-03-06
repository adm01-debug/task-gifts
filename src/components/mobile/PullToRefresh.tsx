import { useState, useCallback, useRef, ReactNode } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { logger } from "@/services/loggingService";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const haptic = useHapticFeedback();

  const pullDistance = useMotionValue(0);
  const opacity = useTransform(pullDistance, [0, threshold], [0, 1]);
  const rotate = useTransform(pullDistance, [0, threshold], [0, 180]);
  const scale = useTransform(pullDistance, [0, threshold * 0.5, threshold], [0.5, 0.8, 1]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;

    // Only trigger if at the top of the scroll container
    if (container.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply resistance
      const resistance = 0.4;
      const distance = diff * resistance;
      pullDistance.set(Math.min(distance, threshold * 1.5));

      // Haptic feedback when reaching threshold
      if (distance >= threshold && pullDistance.get() < threshold) {
        haptic.buttonPress();
      }
    }
  }, [isPulling, disabled, isRefreshing, pullDistance, threshold, haptic]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    const distance = pullDistance.get();

    if (distance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      haptic.questCompleted();

      try {
        await onRefresh();
      } catch (err: unknown) {
        logger.apiError('Pull to refresh', err, 'PullToRefresh');
      } finally {
        setIsRefreshing(false);
      }
    }

    pullDistance.set(0);
    setIsPulling(false);
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh, haptic]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            style={{ height: threshold }}
          >
            <motion.div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                "bg-primary/10 border border-primary/20"
              )}
              style={{ scale, opacity }}
            >
              <motion.div
                style={{ rotate: isRefreshing ? undefined : rotate }}
                animate={isRefreshing ? { rotate: 360 } : undefined}
                transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : undefined}
              >
                <RefreshCw className="w-5 h-5 text-primary" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{
          y: useTransform(pullDistance, (v) => (isRefreshing ? threshold * 0.5 : v * 0.5)),
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
