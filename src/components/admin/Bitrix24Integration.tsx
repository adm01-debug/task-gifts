import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Link2, 
  Link2Off, 
  RefreshCw, 
  Building2, 
  Users, 
  CheckSquare, 
  Calendar,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  useBitrix24Status, 
  useConnectBitrix24,
  useBitrix24WebhookLogs,
  useBitrix24SyncMappings
} from "@/hooks/useBitrix24";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Bitrix24Integration = () => {
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useBitrix24Status();
  const { mutate: connect, isPending: connecting } = useConnectBitrix24();
  const { data: webhookLogs } = useBitrix24WebhookLogs(20);
  const { data: syncMappings } = useBitrix24SyncMappings();
  const [activeTab, setActiveTab] = useState("status");

  const getStatusBadge = () => {
    if (statusLoading) return <Badge variant="outline">Verificando...</Badge>;
    if (!status?.configured) return <Badge variant="destructive">Não Configurado</Badge>;
    if (!status?.connected) return <Badge variant="secondary">Desconectado</Badge>;
    if (status?.expired) return <Badge variant="destructive">Token Expirado</Badge>;
    return <Badge className="bg-green-500">Conectado</Badge>;
  };

  const moduleStats = [
    { icon: Building2, label: "CRM", description: "Leads, Negócios, Contatos", color: "text-blue-500" },
    { icon: CheckSquare, label: "Tarefas", description: "Gestão de tarefas", color: "text-green-500" },
    { icon: Calendar, label: "Calendário", description: "Eventos e atividades", color: "text-purple-500" },
    { icon: Users, label: "Usuários", description: "Estrutura organizacional", color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Link2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Integração Bitrix24</CardTitle>
                <CardDescription>
                  Sincronize CRM, tarefas, calendário e usuários
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status?.domain && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-4 w-4" />
                <span>Domínio: {status.domain}</span>
              </div>
            )}

            <div className="flex gap-2">
              {!status?.connected ? (
                <Button 
                  onClick={() => connect()} 
                  disabled={connecting || !status?.configured}
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4 mr-2" />
                      Conectar ao Bitrix24
                    </>
                  )}
                </Button>
              ) : (
                <Button variant="outline" onClick={() => refetchStatus()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Status
                </Button>
              )}
            </div>

            {!status?.configured && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Configuração Pendente</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure as credenciais OAuth do Bitrix24 para habilitar a integração:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• BITRIX24_CLIENT_ID</li>
                      <li>• BITRIX24_CLIENT_SECRET</li>
                      <li>• BITRIX24_DOMAIN (ex: suaempresa.bitrix24.com.br)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {moduleStats.map((module, index) => (
          <motion.div
            key={module.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${module.color}`}>
                    <module.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{module.label}</p>
                    <p className="text-xs text-muted-foreground">{module.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status" className="gap-2">
            <Activity className="h-4 w-4" />
            Atividade
          </TabsTrigger>
          <TabsTrigger value="sync" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sincronização
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <FileText className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Atividade Recente</CardTitle>
              <CardDescription>Eventos recebidos do Bitrix24</CardDescription>
            </CardHeader>
            <CardContent>
              {webhookLogs?.length ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {webhookLogs.map((log: any) => (
                      <div 
                        key={log.id} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        {log.processed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{log.event_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                          </p>
                          {log.error_message && (
                            <p className="text-xs text-destructive mt-1">{log.error_message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma atividade registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mapeamentos de Sincronização</CardTitle>
              <CardDescription>Entidades sincronizadas entre plataformas</CardDescription>
            </CardHeader>
            <CardContent>
              {syncMappings?.length ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {syncMappings.map((mapping: any) => (
                      <div 
                        key={mapping.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {mapping.entity_type} → {mapping.bitrix_entity_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID Local: {mapping.local_id} | Bitrix ID: {mapping.bitrix_id}
                          </p>
                        </div>
                        <Badge variant={mapping.sync_status === 'synced' ? 'default' : 'secondary'}>
                          {mapping.sync_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum mapeamento encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Logs de Webhook</CardTitle>
              <CardDescription>Histórico detalhado de eventos</CardDescription>
            </CardHeader>
            <CardContent>
              {webhookLogs?.length ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {webhookLogs.map((log: any) => (
                      <details 
                        key={log.id} 
                        className="group rounded-lg bg-muted/50 overflow-hidden"
                      >
                        <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {log.event_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.created_at), "dd/MM HH:mm:ss")}
                            </span>
                          </div>
                          {log.processed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                        </summary>
                        <pre className="p-3 text-xs bg-background/50 overflow-auto max-h-[200px]">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </details>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum log disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
