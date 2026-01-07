import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

// Base skeleton with shimmer animation
const ShimmerSkeleton = memo(function ShimmerSkeleton({ 
  className 
}: { 
  className?: string 
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-muted", className)}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ translateX: ["0%", "200%"] }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "linear",
          repeatDelay: 0.5,
        }}
      />
    </div>
  );
});

// Dashboard Card Skeleton
export const DashboardCardSkeleton = memo(function DashboardCardSkeleton({ 
  className,
  variant = "default"
}: { 
  className?: string;
  variant?: "default" | "stat" | "compact" | "list";
}) {
  if (variant === "stat") {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <ShimmerSkeleton className="h-4 w-20" />
          <ShimmerSkeleton className="h-8 w-8 rounded-full" />
        </div>
        <ShimmerSkeleton className="h-8 w-24 mb-2" />
        <ShimmerSkeleton className="h-3 w-16" />
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={cn("p-3", className)}>
        <div className="flex items-center gap-3">
          <ShimmerSkeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <ShimmerSkeleton className="h-4 w-3/4" />
            <ShimmerSkeleton className="h-3 w-1/2" />
          </div>
        </div>
      </Card>
    );
  }

  if (variant === "list") {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between mb-4">
          <ShimmerSkeleton className="h-5 w-32" />
          <ShimmerSkeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <ShimmerSkeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <ShimmerSkeleton className="h-3.5 w-full max-w-48" />
                <ShimmerSkeleton className="h-2.5 w-20" />
              </div>
              <ShimmerSkeleton className="h-6 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShimmerSkeleton className="h-5 w-5 rounded" />
          <ShimmerSkeleton className="h-5 w-28" />
        </div>
        <ShimmerSkeleton className="h-8 w-20 rounded-md" />
      </div>
      <div className="space-y-3">
        <ShimmerSkeleton className="h-4 w-full" />
        <ShimmerSkeleton className="h-4 w-4/5" />
        <ShimmerSkeleton className="h-4 w-3/5" />
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <ShimmerSkeleton className="h-3 w-24" />
          <ShimmerSkeleton className="h-3 w-16" />
        </div>
      </div>
    </Card>
  );
});

// Stats Grid Skeleton
export const StatsGridSkeleton = memo(function StatsGridSkeleton({ 
  count = 4,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <DashboardCardSkeleton variant="stat" />
        </motion.div>
      ))}
    </div>
  );
});

// Mission Card Skeleton
export const MissionCardSkeleton = memo(function MissionCardSkeleton({ 
  className 
}: { 
  className?: string;
}) {
  return (
    <Card className={cn("p-5 relative overflow-hidden", className)}>
      <div className="flex items-center gap-3 mb-4">
        <ShimmerSkeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <ShimmerSkeleton className="h-3 w-24" />
          <ShimmerSkeleton className="h-5 w-48" />
        </div>
        <ShimmerSkeleton className="h-6 w-20 rounded-full" />
      </div>
      <ShimmerSkeleton className="h-3 w-full mb-3" />
      <ShimmerSkeleton className="h-2 w-full rounded-full mb-4" />
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <ShimmerSkeleton className="h-5 w-16" />
          <ShimmerSkeleton className="h-5 w-12" />
        </div>
        <ShimmerSkeleton className="h-9 w-24 rounded-md" />
      </div>
    </Card>
  );
});

// Widget Grid Skeleton
export const WidgetGridSkeleton = memo(function WidgetGridSkeleton({ 
  columns = 2,
  rows = 2,
  className 
}: { 
  columns?: number;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-1 md:grid-cols-2",
      columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      className
    )}>
      {Array.from({ length: columns * rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <DashboardCardSkeleton variant="list" />
        </motion.div>
      ))}
    </div>
  );
});

// Leaderboard Skeleton
export const LeaderboardSkeleton = memo(function LeaderboardSkeleton({ 
  count = 5,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <ShimmerSkeleton className="h-5 w-28" />
        <ShimmerSkeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
          >
            <ShimmerSkeleton className="h-6 w-6 rounded-full" />
            <ShimmerSkeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1">
              <ShimmerSkeleton className="h-3.5 w-28" />
              <ShimmerSkeleton className="h-2.5 w-16" />
            </div>
            <ShimmerSkeleton className="h-5 w-14" />
          </motion.div>
        ))}
      </div>
    </Card>
  );
});

// Chart Skeleton
export const ChartSkeleton = memo(function ChartSkeleton({ 
  className,
  height = 200
}: { 
  className?: string;
  height?: number;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <ShimmerSkeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <ShimmerSkeleton className="h-7 w-16 rounded-md" />
          <ShimmerSkeleton className="h-7 w-16 rounded-md" />
        </div>
      </div>
      <div 
        className="flex items-end justify-around gap-2"
        style={{ height }}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${30 + Math.random() * 60}%` }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex-1"
          >
            <ShimmerSkeleton className="w-full h-full rounded-t-md" />
          </motion.div>
        ))}
      </div>
      <div className="flex justify-around mt-2">
        {["S", "T", "Q", "Q", "S", "S", "D"].map((day, i) => (
          <ShimmerSkeleton key={i} className="h-3 w-4" />
        ))}
      </div>
    </Card>
  );
});

// Full Dashboard Skeleton
export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <ShimmerSkeleton className="h-8 w-48" />
          <ShimmerSkeleton className="h-4 w-32" />
        </div>
        <ShimmerSkeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Tabs */}
      <ShimmerSkeleton className="h-12 w-full rounded-xl" />

      {/* Stats */}
      <StatsGridSkeleton />

      {/* Mission Highlight */}
      <MissionCardSkeleton />

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <WidgetGridSkeleton columns={2} rows={1} />
          <ChartSkeleton />
        </div>
        <div className="space-y-4">
          <LeaderboardSkeleton />
          <DashboardCardSkeleton variant="list" />
        </div>
      </div>
    </div>
  );
});

export { ShimmerSkeleton };
