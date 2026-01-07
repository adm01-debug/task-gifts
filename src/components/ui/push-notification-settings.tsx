import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  BellOff, 
  BellRing,
  Trophy, 
  Target, 
  TrendingUp, 
  Gift,
  Swords,
  Flame,
  Users,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePushNotifications, GameNotificationType, notificationTemplates } from "@/hooks/use-push-notifications";

interface NotificationPreference {
  type: GameNotificationType;
  enabled: boolean;
  label: string;
  description: string;
  icon: React.ElementType;
}

const defaultPreferences: NotificationPreference[] = [
  { type: "achievement_unlocked", enabled: true, label: "Conquistas", description: "Quando desbloquear badges", icon: Trophy },
  { type: "level_up", enabled: true, label: "Level Up", description: "Ao subir de nível", icon: TrendingUp },
  { type: "quest_completed", enabled: true, label: "Missões", description: "Ao completar missões", icon: Target },
  { type: "daily_bonus", enabled: true, label: "Bônus Diário", description: "Lembrete de recompensas", icon: Gift },
  { type: "challenge_received", enabled: true, label: "Desafios", description: "Convites de duelos", icon: Swords },
  { type: "streak_reminder", enabled: true, label: "Streak", description: "Manter sua sequência", icon: Flame },
  { type: "team_update", enabled: false, label: "Time", description: "Atualizações do time", icon: Users },
  { type: "rank_change", enabled: true, label: "Ranking", description: "Mudanças de posição", icon: TrendingUp },
];

interface PushNotificationSettingsProps {
  className?: string;
  compact?: boolean;
}

export function PushNotificationSettings({ className, compact = false }: PushNotificationSettingsProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showLocalNotification
  } = usePushNotifications();

  const [preferences, setPreferences] = React.useState(defaultPreferences);

  const handleTogglePreference = (type: GameNotificationType) => {
    setPreferences(prev => 
      prev.map(p => p.type === type ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const handleTestNotification = async () => {
    try {
      const template = notificationTemplates.achievement_unlocked({ name: "Teste de Notificação" });
      await showLocalNotification(template);
    } catch (err) {
      console.error("Test notification failed:", err);
    }
  };

  const handleToggleSubscription = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (err) {
      console.error("Subscription toggle failed:", err);
    }
  };

  if (!isSupported) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Notificações push não são suportadas neste navegador.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center justify-between p-3 rounded-lg border bg-card", className)}>
        <div className="flex items-center gap-2">
          {isSubscribed ? (
            <BellRing className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">Notificações Push</span>
          {isSubscribed && (
            <Badge variant="secondary" className="text-xs">Ativo</Badge>
          )}
        </div>
        <Switch
          checked={isSubscribed}
          onCheckedChange={handleToggleSubscription}
          disabled={isLoading || permission === "denied"}
        />
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Bell className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Notificações Push</CardTitle>
            <CardDescription>Receba alertas em tempo real</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Permission Status */}
        {permission === "denied" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Notificações foram bloqueadas. Ative nas configurações do navegador.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <BellRing className="h-5 w-5 text-orange-500" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <Label className="font-medium">Ativar Notificações</Label>
              <p className="text-sm text-muted-foreground">
                {isSubscribed ? "Você receberá notificações" : "Notificações desativadas"}
              </p>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggleSubscription}
            disabled={isLoading || permission === "denied"}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Notification Preferences */}
        <AnimatePresence>
          {isSubscribed && !isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <Label className="text-sm font-medium">Tipos de Notificação</Label>
              <div className="space-y-2">
                {preferences.map((pref) => {
                  const Icon = pref.icon;
                  return (
                    <motion.div
                      key={pref.type}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg transition-colors",
                        pref.enabled ? "bg-primary/5" : "bg-muted/30"
                      )}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-1.5 rounded-md",
                          pref.enabled ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Icon className={cn(
                            "h-4 w-4",
                            pref.enabled ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{pref.label}</span>
                          <p className="text-xs text-muted-foreground">{pref.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={pref.enabled}
                        onCheckedChange={() => handleTogglePreference(pref.type)}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Test Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                className="w-full"
              >
                <BellRing className="h-4 w-4 mr-2" />
                Enviar Notificação de Teste
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success indicator */}
        {isSubscribed && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">
              Notificações ativas neste dispositivo
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
