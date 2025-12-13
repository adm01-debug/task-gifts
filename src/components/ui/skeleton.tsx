import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const skeletonVariants = cva(
  "rounded-md animate-pulse",
  {
    variants: {
      variant: {
        default: "bg-muted",
        shimmer: "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:400%_100%] animate-shimmer",
        glow: "bg-muted relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-primary/10 after:to-transparent after:animate-shimmer",
        subtle: "bg-muted/60",
        card: "bg-card border border-border shadow-xs",
      },
      shape: {
        default: "rounded-md",
        circle: "rounded-full",
        square: "rounded-none",
        pill: "rounded-full",
        card: "rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "default",
    },
  }
);

export interface SkeletonProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, shape, ...props }: SkeletonProps) {
  return (
    <div 
      className={cn(skeletonVariants({ variant, shape }), className)} 
      {...props} 
    />
  );
}

// Pre-built skeleton components for common patterns

interface SkeletonTextProps extends SkeletonProps {
  lines?: number;
  lastLineWidth?: string;
}

function SkeletonText({ 
  lines = 3, 
  lastLineWidth = "60%", 
  className, 
  ...props 
}: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="shimmer"
          className="h-4"
          style={{ 
            width: i === lines - 1 ? lastLineWidth : "100%" 
          }}
          {...props}
        />
      ))}
    </div>
  );
}

function SkeletonAvatar({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      variant="shimmer"
      shape="circle"
      className={cn("h-10 w-10", className)}
      {...props}
    />
  );
}

function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("p-4 rounded-xl border border-border bg-card space-y-4", className)} {...props}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <Skeleton variant="shimmer" className="h-4 w-32" />
          <Skeleton variant="shimmer" className="h-3 w-24" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

function SkeletonStatCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("p-4 rounded-2xl border border-border bg-card", className)} {...props}>
      <div className="flex items-start justify-between mb-3">
        <Skeleton variant="glow" shape="card" className="h-10 w-10" />
        <Skeleton variant="shimmer" shape="pill" className="h-5 w-16" />
      </div>
      <Skeleton variant="shimmer" className="h-4 w-20 mb-2" />
      <Skeleton variant="shimmer" className="h-8 w-28" />
    </div>
  );
}

function SkeletonTable({ rows = 5, cols = 4, className, ...props }: SkeletonProps & { rows?: number; cols?: number }) {
  return (
    <div className={cn("rounded-xl border border-border overflow-hidden", className)} {...props}>
      {/* Header */}
      <div className="flex gap-4 p-4 bg-muted/30 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="shimmer" className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="flex gap-4 p-4 border-b border-border last:border-b-0"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              variant="shimmer" 
              className="h-4 flex-1" 
              style={{ 
                animationDelay: `${(rowIndex * cols + colIndex) * 50}ms` 
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonList({ items = 5, className, ...props }: SkeletonProps & { items?: number }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <SkeletonAvatar className="h-8 w-8" />
          <div className="flex-1 space-y-1.5">
            <Skeleton variant="shimmer" className="h-4 w-3/4" />
            <Skeleton variant="shimmer" className="h-3 w-1/2" />
          </div>
          <Skeleton variant="shimmer" shape="pill" className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

function SkeletonChart({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("p-4 rounded-xl border border-border bg-card", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="shimmer" className="h-5 w-32" />
        <Skeleton variant="shimmer" shape="pill" className="h-8 w-24" />
      </div>
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton 
            key={i}
            variant="glow"
            className="flex-1 rounded-t-md"
            style={{ 
              height: `${30 + Math.random() * 70}%`,
              animationDelay: `${i * 100}ms`
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SkeletonLeaderboard({ items = 5, className, ...props }: SkeletonProps & { items?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <Skeleton 
            variant={i < 3 ? "glow" : "shimmer"} 
            shape="circle" 
            className="h-8 w-8" 
          />
          <SkeletonAvatar className="h-10 w-10" />
          <div className="flex-1 space-y-1.5">
            <Skeleton variant="shimmer" className="h-4 w-28" />
            <Skeleton variant="shimmer" className="h-3 w-20" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton variant="glow" className="h-5 w-16 ml-auto" />
            <Skeleton variant="shimmer" className="h-3 w-12 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { 
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonTable,
  SkeletonList,
  SkeletonChart,
  SkeletonLeaderboard,
  skeletonVariants,
};