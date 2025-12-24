import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { 
  useNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead, 
  useDeleteNotification,
  useClearAllNotifications 
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Notification } from "@/services/notificationsService";

const notificationIcons: Record<string, React.ReactNode> = {
  achievement: <Trophy className="w-4 h-4 text-amber-400" />,
  level_up: <TrendingUp className="w-4 h-4 text-green-400" />,
  xp: <Zap className="w-4 h-4 text-primary" />,
  quest: <Target className="w-4 h-4 text-primary" />,
  leaderboard: <TrendingUp className="w-4 h-4 text-blue-400" />,
  competency_gap: <AlertTriangle className="w-4 h-4 text-red-400" />,
  development_tip: <Lightbulb className="w-4 h-4 text-yellow-400" />,
  competency_celebration: <Sparkles className="w-4 h-4 text-green-400" />,
  churn_risk: <Brain className="w-4 h-4 text-orange-400" />,
  info: <Bell className="w-4 h-4 text-muted-foreground" />,
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem = memo(({ notification, onMarkRead, onDelete }: NotificationItemProps) => {
  const icon = notificationIcons[notification.type] || notificationIcons.info;
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "p-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors group",
        !notification.read && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          notification.read ? "bg-muted" : "bg-primary/10"
        )}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className={cn(
              "text-sm truncate",
              notification.read ? "font-medium text-muted-foreground" : "font-semibold"
            )}>
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
          {notification.message && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {notification.message}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground mt-1">
            {timeAgo}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
              aria-label="Marcar como lida"
            >
              <Check className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            aria-label="Excluir notificação"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

NotificationItem.displayName = "NotificationItem";

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, isLoading, realtimeEnabled } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const clearAll = useClearAllNotifications();

  const handleMarkRead = useCallback((id: string) => {
    markAsRead.mutate(id);
  }, [markAsRead]);

  const handleDelete = useCallback((id: string) => {
    deleteNotification.mutate(id);
  }, [deleteNotification]);

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const handleClearAll = useCallback(() => {
    clearAll.mutate();
  }, [clearAll]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
        >
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
          {realtimeEnabled && (
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-success animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                {unreadCount} novas
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Ler todas
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 flex items-start gap-3">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Sem notificações"
              description="Novas atualizações aparecerão aqui"
              compact
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs text-destructive hover:text-destructive"
              onClick={handleClearAll}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Limpar todas
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
