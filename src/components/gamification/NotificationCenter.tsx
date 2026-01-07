import { memo } from "react";
import { motion } from "framer-motion";
import { Bell, Gift, Trophy, Zap, Star, CheckCircle2, X, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "achievement" | "reward" | "levelup" | "quest" | "social" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionLabel?: string;
}

const mockNotifications: Notification[] = [
  { id: "1", type: "achievement", title: "Nova Conquista!", message: "Você desbloqueou 'Mestre das Tarefas'", time: "2min", read: false },
  { id: "2", type: "levelup", title: "Level Up! 🎉", message: "Você alcançou o nível 15", time: "1h", read: false, actionLabel: "Ver Recompensas" },
  { id: "3", type: "reward", title: "Recompensa Diária", message: "+100 XP e +50 moedas disponíveis", time: "3h", read: false, actionLabel: "Resgatar" },
  { id: "4", type: "quest", title: "Quest Completada", message: "Você finalizou 'Sprint Semanal'", time: "5h", read: true },
  { id: "5", type: "social", title: "Novo Kudos!", message: "Maria enviou um kudos para você", time: "1d", read: true },
];

const typeConfig = {
  achievement: { icon: Trophy, color: "text-purple-500", bg: "bg-purple-500/10" },
  reward: { icon: Gift, color: "text-amber-500", bg: "bg-amber-500/10" },
  levelup: { icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  quest: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  social: { icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
  system: { icon: Bell, color: "text-gray-500", bg: "bg-gray-500/10" },
};

export const NotificationCenter = memo(function NotificationCenter() {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <span>Notificações</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">Marcar lidas</Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto">
        {mockNotifications.map((notif, index) => {
          const config = typeConfig[notif.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "p-3 rounded-xl border transition-all",
                !notif.read && "bg-primary/5 border-primary/20"
              )}
            >
              <div className="flex gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">{notif.title}</h5>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{notif.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{notif.message}</p>
                  {notif.actionLabel && (
                    <Button size="sm" variant="outline" className="h-6 text-[10px] mt-2">{notif.actionLabel}</Button>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0"><X className="h-3 w-3" /></Button>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
});
