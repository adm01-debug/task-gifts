import { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Slack,
  Calendar,
  Users,
  Link,
  Link2Off,
  Check,
  Settings,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "disconnected" | "error";
  category: "communication" | "calendar" | "hr" | "productivity";
  lastSync?: Date;
  features: string[];
  configurable?: boolean;
}

// Mock data
const integrations: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Receba notificações e atualizações diretamente no Slack",
    icon: <Slack className="h-6 w-6" />,
    status: "connected",
    category: "communication",
    lastSync: new Date(Date.now() - 1000 * 60 * 5),
    features: [
      "Notificações de conquistas",
      "Lembretes de tarefas",
      "Kudos via comando /kudos",
      "Atualizações de equipe",
    ],
    configurable: true,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Integração completa com Microsoft Teams",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.6 10.8c0-1.6-1.3-2.8-2.8-2.8s-2.8 1.3-2.8 2.8v4.7H9.3V9.4c0-2.9 2.4-5.3 5.3-5.3s5.3 2.4 5.3 5.3v6.1h-0.3V10.8z" />
        <path d="M12.2 14h-7c-0.4 0-0.8-0.4-0.8-0.8V7c0-0.4 0.4-0.8 0.8-0.8h7c0.4 0 0.8 0.4 0.8 0.8v6.2c0 0.4-0.4 0.8-0.8 0.8z" />
      </svg>
    ),
    status: "disconnected",
    category: "communication",
    features: [
      "Notificações nativas",
      "Cards interativos",
      "Agendamento de reuniões",
    ],
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sincronize eventos e prazos automaticamente",
    icon: <Calendar className="h-6 w-6" />,
    status: "connected",
    category: "calendar",
    lastSync: new Date(Date.now() - 1000 * 60 * 30),
    features: [
      "Prazos de tarefas",
      "Check-ins agendados",
      "Eventos de equipe",
    ],
    configurable: true,
  },
  {
    id: "outlook-calendar",
    name: "Outlook Calendar",
    description: "Integração com Microsoft Outlook",
    icon: <Calendar className="h-6 w-6" />,
    status: "disconnected",
    category: "calendar",
    features: [
      "Sincronização bidirecional",
      "Bloqueio de agenda",
      "Convites automáticos",
    ],
  },
  {
    id: "adp",
    name: "ADP",
    description: "Sincronize dados de RH automaticamente",
    icon: <Users className="h-6 w-6" />,
    status: "disconnected",
    category: "hr",
    features: [
      "Dados de colaboradores",
      "Hierarquia organizacional",
      "Informações de departamento",
    ],
  },
  {
    id: "workday",
    name: "Workday",
    description: "Integração com Workday HCM",
    icon: <Users className="h-6 w-6" />,
    status: "error",
    category: "hr",
    features: [
      "Perfis de colaboradores",
      "Metas e objetivos",
      "Avaliações de desempenho",
    ],
  },
];

// Integration Card Component
const IntegrationCard = memo(function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onConfigure,
}: {
  integration: Integration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onConfigure: (id: string) => void;
}) {
  const statusColors = {
    connected: "bg-green-500",
    disconnected: "bg-slate-400",
    error: "bg-red-500",
  };

  const statusLabels = {
    connected: "Conectado",
    disconnected: "Desconectado",
    error: "Erro",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-shadow hover:shadow-lg",
        integration.status === "error" && "border-red-500/50"
      )}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn(
              "p-3 rounded-xl",
              integration.status === "connected"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}>
              {integration.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{integration.name}</h3>
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-2 h-2 rounded-full", statusColors[integration.status])} />
                  <span className="text-xs text-muted-foreground">
                    {statusLabels[integration.status]}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {integration.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {integration.features.slice(0, 3).map((feature, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-normal">
                    {feature}
                  </Badge>
                ))}
                {integration.features.length > 3 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    +{integration.features.length - 3}
                  </Badge>
                )}
              </div>

              {/* Last sync */}
              {integration.lastSync && integration.status === "connected" && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                  <RefreshCw className="h-3 w-3" />
                  Última sincronização:{" "}
                  {new Date(integration.lastSync).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}

              {/* Error message */}
              {integration.status === "error" && (
                <div className="flex items-center gap-2 text-xs text-red-500 mb-3">
                  <AlertCircle className="h-3 w-3" />
                  Falha na conexão. Verifique as credenciais.
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {integration.status === "connected" ? (
                  <>
                    {integration.configurable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onConfigure(integration.id)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configurar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDisconnect(integration.id)}
                    >
                      <Link2Off className="h-4 w-4 mr-1" />
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onConnect(integration.id)}
                  >
                    <Link className="h-4 w-4 mr-1" />
                    Conectar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Slack Configuration Dialog
const SlackConfigDialog = memo(function SlackConfigDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [config, setConfig] = useState({
    achievements: true,
    tasks: true,
    kudos: true,
    dailyDigest: false,
    channel: "#general",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Slack className="h-5 w-5" />
            Configurar Slack
          </DialogTitle>
          <DialogDescription>
            Personalize como as notificações são enviadas para o Slack
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="channel">Canal padrão</Label>
            <Input
              id="channel"
              value={config.channel}
              onChange={(e) => setConfig({ ...config, channel: e.target.value })}
              placeholder="#canal"
              className="mt-1.5"
            />
          </div>

          <div className="space-y-4">
            <Label>Notificações</Label>
            {[
              { key: "achievements" as const, label: "Conquistas e badges" },
              { key: "tasks" as const, label: "Lembretes de tarefas" },
              { key: "kudos" as const, label: "Kudos recebidos" },
              { key: "dailyDigest" as const, label: "Resumo diário" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <Switch
                  checked={config[key]}
                  onCheckedChange={(checked) => setConfig({ ...config, [key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => {
            toast.success("Configurações salvas!");
            onOpenChange(false);
          }}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// Main Component
export const ExternalIntegrations = memo(function ExternalIntegrations({
  className,
}: {
  className?: string;
}) {
  const [slackConfigOpen, setSlackConfigOpen] = useState(false);
  const categories = ["communication", "calendar", "hr"] as const;
  const categoryLabels = {
    communication: "Comunicação",
    calendar: "Calendário",
    hr: "RH",
  };

  const handleConnect = useCallback((id: string) => {
    toast.success(`Conectando ${id}...`, {
      description: "Você será redirecionado para autorização.",
    });
  }, []);

  const handleDisconnect = useCallback((id: string) => {
    toast.success(`${id} desconectado com sucesso.`);
  }, []);

  const handleConfigure = useCallback((id: string) => {
    if (id === "slack") {
      setSlackConfigOpen(true);
    }
  }, []);

  const connectedCount = integrations.filter((i) => i.status === "connected").length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Integrações
          </h2>
          <p className="text-muted-foreground">
            Conecte suas ferramentas favoritas para uma experiência integrada
          </p>
        </div>

        <Badge variant="secondary" className="text-sm">
          {connectedCount} de {integrations.length} conectadas
        </Badge>
      </div>

      {/* Integration Stats */}
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => {
          const categoryIntegrations = integrations.filter((i) => i.category === category);
          const connectedInCategory = categoryIntegrations.filter((i) => i.status === "connected").length;
          
          return (
            <Card key={category}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{categoryLabels[category]}</p>
                <p className="text-2xl font-bold mt-1">
                  {connectedInCategory}/{categoryIntegrations.length}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Integrations by Category */}
      {categories.map((category) => {
        const categoryIntegrations = integrations.filter((i) => i.category === category);
        
        return (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-4">{categoryLabels[category]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryIntegrations.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <IntegrationCard
                    integration={integration}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onConfigure={handleConfigure}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Slack Config Dialog */}
      <SlackConfigDialog open={slackConfigOpen} onOpenChange={setSlackConfigOpen} />

      {/* Request Integration */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Não encontrou sua ferramenta?</h3>
              <p className="text-sm text-muted-foreground">
                Solicite uma nova integração e nossa equipe irá avaliar.
              </p>
            </div>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Solicitar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default ExternalIntegrations;
