import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Clock,
  Award,
  Target,
  Users,
  MessageSquare,
  Zap,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Settings,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Types
interface Notification {
  id: string;
  type: "achievement" | "task" | "social" | "system" | "reminder" | "insight";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high";
  action?: {
    label: string;
    href: string;
  };
  metadata?: Record<string, unknown>;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "achievement",
    title: "Nova Conquista Desbloqueada! 🏆",
    message: "Você completou 10 tarefas consecutivas e ganhou o badge 'Consistente'",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    priority: "high",
    action: { label: "Ver Badge", href: "/achievements" },
  },
  {
    id: "2",
    type: "task",
    title: "Tarefa Próxima do Prazo",
    message: "Completar módulo de Liderança vence amanhã",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    priority: "high",
    action: { label: "Ver Tarefa", href: "/tasks" },
  },
  {
    id: "3",
    type: "social",
    title: "Você recebeu um Kudos! 💜",
    message: "Maria Silva te enviou reconhecimento por colaboração em equipe",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: false,
    priority: "medium",
    action: { label: "Ver Kudos", href: "/social" },
  },
  {
    id: "4",
    type: "insight",
    title: "Insight de Performance",
    message: "Seu engajamento subiu 15% esta semana. Continue assim!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
    priority: "low",
  },
  {
    id: "5",
    type: "reminder",
    title: "Pesquisa de Clima Disponível",
    message: "Participe da pesquisa mensal e ganhe 50 XP",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    read: true,
    priority: "medium",
    action: { label: "Responder", href: "/surveys" },
  },
  {
    id: "6",
    type: "system",
    title: "Novo Recurso Disponível",
    message: "Conheça o novo sistema de Battle Pass e ganhe recompensas exclusivas",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    priority: "low",
    action: { label: "Explorar", href: "/battle-pass" },
  },
];

// Icon mapping
const typeIcons = {
  achievement: Award,
  task: Target,
  social: Users,
  system: Bell,
  reminder: Clock,
  insight: TrendingUp,
};

const typeColors = {
  achievement: "text-amber-500 bg-amber-500/10",
  task: "text-blue-500 bg-blue-500/10",
  social: "text-pink-500 bg-pink-500/10",
  system: "text-slate-500 bg-slate-500/10",
  reminder: "text-orange-500 bg-orange-500/10",
  insight: "text-green-500 bg-green-500/10",
};

const priorityColors = {
  low: "border-l-slate-400",
  medium: "border-l-amber-400",
  high: "border-l-red-400",
};

// Notification Item Component
const NotificationItem = memo(function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const Icon = typeIcons[notification.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className={cn(
        "p-4 border-l-4 rounded-r-lg transition-colors",
        priorityColors[notification.priority],
        notification.read ? "bg-muted/30" : "bg-card hover:bg-muted/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", typeColors[notification.type])}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={cn("font-medium text-sm", !notification.read && "font-semibold")}>
                {notification.title}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {notification.message}
              </p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => onDismiss(notification.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(notification.timestamp, {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>

            {notification.action && (
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                {notification.action.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Notification Bell with Badge
export const NotificationBell = memo(function NotificationBell({
  count,
  onClick,
}: {
  count: number;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
});

// Main Notifications Panel
export const NotificationsPanel = memo(function NotificationsPanel({
  className,
}: {
  className?: string;
}) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<string>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Notificações</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} novas
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter("all")}>
                  Todas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("unread")}>
                  Não lidas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter("achievement")}>
                  <Award className="h-4 w-4 mr-2" />
                  Conquistas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("task")}>
                  <Target className="h-4 w-4 mr-2" />
                  Tarefas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("social")}>
                  <Users className="h-4 w-4 mr-2" />
                  Social
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma notificação
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

// Notification Settings
export const NotificationSettings = memo(function NotificationSettings() {
  const [settings, setSettings] = useState({
    achievements: true,
    tasks: true,
    social: true,
    reminders: true,
    insights: true,
    system: true,
    pushEnabled: false,
    emailDigest: true,
    quietHours: false,
  });

  const toggleSetting = useCallback((key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações de Notificações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="font-medium mb-4">Categorias</h4>
          <div className="space-y-4">
            {[
              { key: "achievements" as const, label: "Conquistas", icon: Award },
              { key: "tasks" as const, label: "Tarefas", icon: Target },
              { key: "social" as const, label: "Social", icon: Users },
              { key: "reminders" as const, label: "Lembretes", icon: Clock },
              { key: "insights" as const, label: "Insights", icon: TrendingUp },
              { key: "system" as const, label: "Sistema", icon: Bell },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={settings[key]}
                  onCheckedChange={() => toggleSetting(key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Delivery */}
        <div>
          <h4 className="font-medium mb-4">Entrega</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p>Notificações Push</p>
                <p className="text-sm text-muted-foreground">
                  Receba notificações no navegador
                </p>
              </div>
              <Switch
                checked={settings.pushEnabled}
                onCheckedChange={() => toggleSetting("pushEnabled")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p>Resumo por E-mail</p>
                <p className="text-sm text-muted-foreground">
                  Receba um resumo diário por e-mail
                </p>
              </div>
              <Switch
                checked={settings.emailDigest}
                onCheckedChange={() => toggleSetting("emailDigest")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p>Horário Silencioso</p>
                <p className="text-sm text-muted-foreground">
                  Sem notificações das 22h às 8h
                </p>
              </div>
              <Switch
                checked={settings.quietHours}
                onCheckedChange={() => toggleSetting("quietHours")}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Toast-style notification
export const ToastNotification = memo(function ToastNotification({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const Icon = typeIcons[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-50 w-80"
    >
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", typeColors[notification.type])}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {notification.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default NotificationsPanel;
