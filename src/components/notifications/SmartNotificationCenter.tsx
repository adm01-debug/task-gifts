import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, Check, CheckCheck, Trash2, Settings, 
  Trophy, Users, Target, Calendar, MessageCircle,
  Zap, Gift, AlertCircle, Info, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "achievement" | "social" | "quest" | "event" | "system" | "reward";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "achievement",
    title: "Nova Conquista Desbloqueada!",
    message: "Você completou 10 missões seguidas e ganhou o badge 'Imparável'!",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    priority: "high"
  },
  {
    id: "2",
    type: "social",
    title: "Novo Seguidor",
    message: "Maria Silva começou a seguir você!",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    priority: "medium"
  },
  {
    id: "3",
    type: "quest",
    title: "Missão Expirando",
    message: "Sua missão 'Feedback Semanal' expira em 2 horas!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: false,
    priority: "urgent"
  },
  {
    id: "4",
    type: "event",
    title: "Evento Especial",
    message: "O evento de Verão começa amanhã! Prepare-se para recompensas exclusivas.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
    priority: "medium"
  },
  {
    id: "5",
    type: "reward",
    title: "Recompensa Disponível",
    message: "Você tem 500 moedas para resgatar na loja!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
    priority: "low"
  },
  {
    id: "6",
    type: "system",
    title: "Atualização do Sistema",
    message: "Novos recursos foram adicionados ao dashboard!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    priority: "low"
  }
];

const typeConfig = {
  achievement: { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  social: { icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  quest: { icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
  event: { icon: Calendar, color: "text-green-500", bg: "bg-green-500/10" },
  system: { icon: Info, color: "text-muted-foreground", bg: "bg-muted" },
  reward: { icon: Gift, color: "text-pink-500", bg: "bg-pink-500/10" }
};

const priorityConfig = {
  low: { color: "bg-muted text-muted-foreground" },
  medium: { color: "bg-blue-500/20 text-blue-500" },
  high: { color: "bg-orange-500/20 text-orange-500" },
  urgent: { color: "bg-red-500/20 text-red-500" }
};

const NotificationItem = memo(function NotificationItem({ 
  notification, 
  onRead, 
  onDelete 
}: { 
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;
  
  const timeAgo = useMemo(() => {
    const diff = Date.now() - notification.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return "Agora";
  }, [notification.timestamp]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md",
        notification.read ? "bg-background" : "bg-accent/50 border-primary/20"
      )}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      <div className="flex gap-3">
        <div className={cn("p-2 rounded-full shrink-0", config.bg)}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{notification.title}</h4>
              {!notification.read && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <Badge 
              variant="secondary" 
              className={cn("text-[10px] shrink-0", priorityConfig[notification.priority].color)}
            >
              {notification.priority === "urgent" && <Zap className="w-3 h-3 mr-1" />}
              {notification.priority}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
            
            <div className="flex gap-1">
              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRead(notification.id);
                  }}
                >
                  <Check className="w-3 h-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export const SmartNotificationCenter = memo(function SmartNotificationCenter({ 
  className 
}: { 
  className?: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

  const handleRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-primary" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold"
                >
                  {unreadCount}
                </motion.span>
              )}
            </div>
            <CardTitle className="text-lg">Notificações</CardTitle>
          </div>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="h-8 text-xs"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Marcar todas
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="all" className="text-xs">
              Todas
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Não lidas
              {unreadCount > 0 && (
                <Badge className="ml-1 h-4 px-1 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="achievement" className="text-xs">
              <Trophy className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="quest" className="text-xs">
              <Target className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Nenhuma notificação</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Você está em dia com tudo!
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={handleRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={handleClearAll}
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Limpar todas as notificações
              </Button>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
});

export default SmartNotificationCenter;
