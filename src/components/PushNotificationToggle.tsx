import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { cn } from "@/lib/utils";

interface PushNotificationToggleProps {
  compact?: boolean;
}

export function PushNotificationToggle({ compact = false }: PushNotificationToggleProps) {
  const { isSupported, isGranted, isDenied, requestPermission } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  if (compact) {
    return (
      <Button
        variant={isGranted ? "outline" : "default"}
        size="sm"
        onClick={requestPermission}
        disabled={isDenied}
        className={cn(
          "gap-2",
          isGranted && "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
        )}
      >
        {isGranted ? (
          <>
            <BellRing className="w-4 h-4" />
            Ativadas
          </>
        ) : isDenied ? (
          <>
            <BellOff className="w-4 h-4" />
            Bloqueadas
          </>
        ) : (
          <>
            <Bell className="w-4 h-4" />
            Ativar
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba alertas sobre conquistas, kudos e atividades importantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isGranted ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <BellRing className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-600 dark:text-green-400">
                Notificações ativadas
              </p>
              <p className="text-sm text-muted-foreground">
                Você receberá alertas importantes
              </p>
            </div>
          </div>
        ) : isDenied ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <BellOff className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Notificações bloqueadas
              </p>
              <p className="text-sm text-muted-foreground">
                Habilite nas configurações do navegador
              </p>
            </div>
          </div>
        ) : (
          <Button onClick={requestPermission} className="w-full">
            <Bell className="w-4 h-4 mr-2" />
            Ativar Notificações Push
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
