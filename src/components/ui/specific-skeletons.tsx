import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Animation variants for staggered loading
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

// ============ STAT CARDS ============
interface StatCardSkeletonProps {
  className?: string;
  showIcon?: boolean;
  showTrend?: boolean;
}

export function StatCardSkeleton({ className, showIcon = true, showTrend = true }: StatCardSkeletonProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
            {showTrend && (
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-12" />
              </div>
            )}
          </div>
          {showIcon && <Skeleton className="h-10 w-10 rounded-lg" />}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <motion.div 
      className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i} variants={itemVariants}>
          <StatCardSkeleton />
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============ LEADERBOARD ============
interface LeaderboardSkeletonProps {
  count?: number;
  showMedals?: boolean;
  className?: string;
}

export function LeaderboardSkeleton({ count = 5, showMedals = true, className }: LeaderboardSkeletonProps) {
  return (
    <motion.div 
      className={cn("space-y-3", className)}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
          className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
        >
          {showMedals ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <Skeleton className="h-6 w-6 rounded" />
          )}
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============ QUEST LIST ============
export function QuestListSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <motion.div 
      className={cn("space-y-3", className)}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
          className="p-4 rounded-lg bg-card border border-border"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============ ACHIEVEMENT GRID ============
export function AchievementGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <motion.div 
      className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Skeleton className="h-16 w-16 rounded-full mb-3" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
              <div className="flex items-center gap-2 mt-3">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-14" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============ PROFILE CARD ============
export function ProfileCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-1">
                <Skeleton className="h-6 w-12 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ TRAIL/COURSE CARD ============
export function TrailCardSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <motion.div 
      className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i} variants={itemVariants}>
          <Card className="overflow-hidden">
            <Skeleton className="h-32 w-full" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============ NOTIFICATION LIST ============
export function NotificationListSkeleton({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <motion.div 
      className={cn("space-y-2", className)}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50"
        >
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-2 w-2 rounded-full" />
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============ ACTIVITY FEED ============
export function ActivityFeedSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <motion.div 
      className={cn("space-y-4", className)}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex items-center gap-4 pt-2">
                    <Skeleton className="h-6 w-14" />
                    <Skeleton className="h-6 w-14" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============ TABLE ROW ============
export function TableRowSkeleton({ columns = 5, count = 5, className }: { columns?: number; count?: number; className?: string }) {
  return (
    <motion.div 
      className={cn("space-y-2", className)}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
          className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border"
        >
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton 
              key={j} 
              className={cn(
                "h-4",
                j === 0 ? "w-8" : j === 1 ? "w-40 flex-1" : "w-20"
              )} 
            />
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============ CHART SKELETON ============
export function ChartSkeleton({ type = "bar", className }: { type?: "bar" | "line" | "pie"; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-60" />
      </CardHeader>
      <CardContent>
        {type === "pie" ? (
          <div className="flex items-center justify-center py-8">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
        ) : (
          <div className="h-64 flex items-end gap-2 pt-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div
                key={i}
                className="flex-1"
                initial={{ height: 0 }}
                animate={{ height: `${30 + Math.random() * 70}%` }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Skeleton className="h-full w-full rounded-t" />
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============ CALENDAR SKELETON ============
export function CalendarSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============ KPI DASHBOARD SKELETON ============
export function KPIDashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <StatsGridSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton type="bar" />
        <ChartSkeleton type="line" />
      </div>
      <LeaderboardSkeleton count={5} />
    </div>
  );
}

// ============ FULL PAGE SKELETON ============
export function FullPageSkeleton({ className }: { className?: string }) {
  return (
    <motion.div 
      className={cn("p-6 space-y-6", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Stats */}
      <StatsGridSkeleton count={4} />

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <LeaderboardSkeleton count={5} showMedals={false} />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
