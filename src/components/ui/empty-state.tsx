import { motion } from "framer-motion";
import { LucideIcon, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-6 px-4" : "py-12 px-6",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full bg-muted flex items-center justify-center mb-4",
          compact ? "w-10 h-10" : "w-16 h-16"
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground",
            compact ? "w-5 h-5" : "w-8 h-8"
          )}
        />
      </div>
      <h3
        className={cn(
          "font-semibold text-foreground",
          compact ? "text-sm mb-1" : "text-lg mb-2"
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "text-muted-foreground max-w-sm",
            compact ? "text-xs mb-3" : "text-sm mb-4"
          )}
        >
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          size={compact ? "sm" : "default"}
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

interface EmptyStateCardProps extends EmptyStateProps {
  cardClassName?: string;
}

export function EmptyStateCard({ cardClassName, ...props }: EmptyStateCardProps) {
  return (
    <Card className={cn("border-dashed", cardClassName)}>
      <CardContent className="p-0">
        <EmptyState {...props} />
      </CardContent>
    </Card>
  );
}
