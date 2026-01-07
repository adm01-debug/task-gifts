import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, AlertCircle, Info, XCircle, 
  Zap, Trophy, Star, Flame, Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type FeedbackType = "success" | "error" | "warning" | "info" | "xp" | "achievement" | "streak" | "reward";

interface FeedbackConfig {
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

const feedbackConfigs: Record<FeedbackType, FeedbackConfig> = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/30",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-500/10",
    iconColor: "text-red-500",
    borderColor: "border-red-500/30",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/30",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
    borderColor: "border-blue-500/30",
  },
  xp: {
    icon: Zap,
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/30",
  },
  achievement: {
    icon: Trophy,
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
    borderColor: "border-purple-500/30",
  },
  streak: {
    icon: Flame,
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-500",
    borderColor: "border-orange-500/30",
  },
  reward: {
    icon: Gift,
    bgColor: "bg-pink-500/10",
    iconColor: "text-pink-500",
    borderColor: "border-pink-500/30",
  },
};

// Inline feedback (aparece junto ao elemento)
interface InlineFeedbackProps {
  type: FeedbackType;
  message: string;
  visible: boolean;
  className?: string;
}

export const InlineFeedback = memo(function InlineFeedback({
  type,
  message,
  visible,
  className,
}: InlineFeedbackProps) {
  const config = feedbackConfigs[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border",
            config.bgColor,
            config.borderColor,
            className
          )}
        >
          <Icon className={cn("w-4 h-4 flex-shrink-0", config.iconColor)} />
          <span className="text-sm">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Toast gamificado
interface GamifiedToastProps {
  type: FeedbackType;
  title: string;
  message?: string;
  value?: string | number;
  visible: boolean;
  onClose?: () => void;
  duration?: number;
}

export const GamifiedToast = memo(function GamifiedToast({
  type,
  title,
  message,
  value,
  visible,
  onClose,
  duration = 4000,
}: GamifiedToastProps) {
  const config = feedbackConfigs[type];
  const Icon = config.icon;

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          className={cn(
            "fixed top-20 right-4 z-[100] max-w-sm",
            "flex items-start gap-3 p-4 rounded-xl border shadow-lg",
            "bg-background/95 backdrop-blur-sm",
            config.borderColor
          )}
        >
          {/* Icon with animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.1 }}
            className={cn(
              "p-2 rounded-full flex-shrink-0",
              config.bgColor
            )}
          >
            <Icon className={cn("w-5 h-5", config.iconColor)} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">{title}</h4>
              {value && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className={cn(
                    "text-sm font-bold px-2 py-0.5 rounded-full",
                    config.bgColor,
                    config.iconColor
                  )}
                >
                  +{value}
                </motion.span>
              )}
            </div>
            {message && (
              <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
            )}
          </div>

          {/* Progress bar */}
          <motion.div
            className={cn("absolute bottom-0 left-0 h-1 rounded-b-xl", config.iconColor.replace("text-", "bg-"))}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Floating action feedback (mostra no centro da tela)
interface ActionFeedbackProps {
  type: FeedbackType;
  title: string;
  subtitle?: string;
  visible: boolean;
  onComplete?: () => void;
}

export const ActionFeedback = memo(function ActionFeedback({
  type,
  title,
  subtitle,
  visible,
  onComplete,
}: ActionFeedbackProps) {
  const config = feedbackConfigs[type];
  const Icon = config.icon;

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: -20 }}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-2xl",
              "bg-background/95 backdrop-blur-md shadow-2xl border",
              config.borderColor
            )}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className={cn(
                "p-4 rounded-full",
                config.bgColor
              )}
            >
              <Icon className={cn("w-10 h-10", config.iconColor)} />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-bold text-foreground"
            >
              {title}
            </motion.h3>

            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-muted-foreground"
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Status indicator (online/offline, etc)
interface StatusIndicatorProps {
  status: "online" | "offline" | "busy" | "away";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusColors = {
  online: "bg-emerald-500",
  offline: "bg-gray-400",
  busy: "bg-red-500",
  away: "bg-amber-500",
};

const statusLabels = {
  online: "Online",
  offline: "Offline",
  busy: "Ocupado",
  away: "Ausente",
};

export const StatusIndicator = memo(function StatusIndicator({
  status,
  showLabel = false,
  size = "md",
  className,
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <motion.div
        className={cn(
          "rounded-full",
          statusColors[status],
          sizeClasses[size]
        )}
        animate={status === "online" ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {statusLabels[status]}
        </span>
      )}
    </div>
  );
});

// Badge notification indicator
interface BadgeIndicatorProps {
  count: number;
  max?: number;
  showZero?: boolean;
  className?: string;
}

export const BadgeIndicator = memo(function BadgeIndicator({
  count,
  max = 99,
  showZero = false,
  className,
}: BadgeIndicatorProps) {
  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1",
        "flex items-center justify-center",
        "text-xs font-bold text-white bg-red-500 rounded-full",
        className
      )}
    >
      {displayCount}
    </motion.span>
  );
});

export type { FeedbackType };
