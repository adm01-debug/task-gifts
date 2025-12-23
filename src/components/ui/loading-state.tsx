import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  compact?: boolean;
}

export function LoadingState({
  message = "Carregando...",
  className,
  compact = false,
}: LoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col items-center justify-center",
        compact ? "py-4" : "py-12",
        className
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-primary mb-3",
          compact ? "w-5 h-5" : "w-8 h-8"
        )}
      />
      <p
        className={cn(
          "text-muted-foreground",
          compact ? "text-xs" : "text-sm"
        )}
      >
        {message}
      </p>
    </motion.div>
  );
}

interface LoadingStateCardProps extends LoadingStateProps {
  cardClassName?: string;
}

export function LoadingStateCard({ cardClassName, ...props }: LoadingStateCardProps) {
  return (
    <Card className={cardClassName}>
      <CardContent className="p-0">
        <LoadingState {...props} />
      </CardContent>
    </Card>
  );
}

// Skeleton variants for common patterns
interface SkeletonListProps {
  count?: number;
  className?: string;
}

export function SkeletonList({ count = 3, className }: SkeletonListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6, className }: SkeletonListProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4, className }: SkeletonListProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
