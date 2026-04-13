import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";

interface CopilotAlert {
  id: string;
  type: "urgent" | "warning" | "positive" | "suggestion";
  icon: React.ElementType;
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  actions?: { label: string; onClick: () => void; variant?: "default" | "outline" | "ghost" }[];
}

const alertStyles: Record<string, string> = {
  urgent: "bg-red-500/10 border-red-500/30 hover:border-red-500/50",
  warning: "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50",
  positive: "bg-green-500/10 border-green-500/30 hover:border-green-500/50",
  suggestion: "bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50",
};

const alertIconColors: Record<string, string> = {
  urgent: "text-red-500",
  warning: "text-amber-500",
  positive: "text-green-500",
  suggestion: "text-blue-500",
};

export function CopilotAlertsList({ alerts, title, titleIcon: TitleIcon, titleColor, emptyText, onDismiss }: {
  alerts: CopilotAlert[];
  title: string;
  titleIcon: React.ElementType;
  titleColor: string;
  emptyText?: string;
  onDismiss: (id: string) => void;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg flex items-center gap-2 ${titleColor}`}><TitleIcon className="w-5 h-5" />{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-3">
            <AnimatePresence>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-500" /><p>{emptyText || "Tudo em ordem!"}</p></div>
              ) : (
                alerts.map((alert) => (
                  <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-lg border ${alertStyles[alert.type] || ""}`}>
                    <div className="flex items-start gap-3">
                      <alert.icon className={`w-5 h-5 ${alertIconColors[alert.type] || ""} shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 h-6 w-6" onClick={() => onDismiss(alert.id)}><X className="w-3 h-3" /></Button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function UrgentAlertsList({ alerts, onDismiss }: { alerts: CopilotAlert[]; onDismiss: (id: string) => void }) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
            <Card className={`border ${alertStyles[alert.type]} transition-all`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-red-500/20"><alert.icon className={`w-5 h-5 ${alertIconColors[alert.type]}`} /></div>
                  {alert.userAvatar !== undefined && (
                    <Avatar className="w-10 h-10"><AvatarImage src={alert.userAvatar || ""} /><AvatarFallback>{alert.userName?.charAt(0)}</AvatarFallback></Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{alert.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{alert.description}</p>
                    {alert.actions && alert.actions.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {alert.actions.map((action, idx) => (
                          <Button key={idx} size="sm" variant={action.variant || "default"} onClick={action.onClick}>{action.label}</Button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => onDismiss(alert.id)}><X className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
