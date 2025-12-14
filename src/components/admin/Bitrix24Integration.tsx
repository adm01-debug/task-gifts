import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Link2, 
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
  ExternalLink,
  UserCheck,
  Timer
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  useBitrix24Status, 
  useConnectBitrix24,
  useBitrix24WebhookLogs,
  useBitrix24SyncMappings,
  useSyncBitrix24Users,
  useBitrix24UserMappings,
  useSyncBitrix24Calendar,
  useBitrix24CalendarMappings,
  useBitrix24AttendanceMappings
} from "@/hooks/useBitrix24";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Bitrix24Integration = () => {
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useBitrix24Status();
  const { mutate: connect, isPending: connecting } = useConnectBitrix24();
  const { mutate: syncUsers, isPending: syncingUsers } = useSyncBitrix24Users();
  const { mutate: syncCalendar, isPending: syncingCalendar } = useSyncBitrix24Calendar();
  const { data: webhookLogs } = useBitrix24WebhookLogs(20);
  const { data: syncMappings } = useBitrix24SyncMappings();
  const { data: userMappings } = useBitrix24UserMappings();
  const { data: calendarMappings } = useBitrix24CalendarMappings();
  const { data: attendanceMappings } = useBitrix24AttendanceMappings();
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
    { icon: Timer, label: "Jornada", description: "Controle de ponto", color: "text-cyan-500" },
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="status" className="gap-2">
            <Activity className="h-4 w-4" />
            Atividade
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <Timer className="h-4 w-4" />
            Jornada
          </TabsTrigger>
          <TabsTrigger value="sync" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Mapeamentos
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

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Sincronização de Colaboradores</CardTitle>
                  <CardDescription>Vincule usuários do Bitrix24 com perfis do sistema</CardDescription>
                </div>
                <Button 
                  onClick={() => syncUsers()} 
                  disabled={syncingUsers || !status?.connected}
                  size="sm"
                >
                  {syncingUsers ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sincronizar Agora
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {userMappings?.length ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {userMappings.map((mapping: any) => {
                      const metadata = mapping.metadata as Record<string, any> || {};
                      const fullName = [metadata.name, metadata.last_name].filter(Boolean).join(' ');
                      
                      return (
                        <div 
                          key={mapping.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{fullName || `Usuário ${mapping.bitrix_id}`}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {metadata.email && <span>{metadata.email}</span>}
                                {metadata.position && (
                                  <>
                                    <span>•</span>
                                    <span>{metadata.position}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={metadata.active !== false ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {metadata.active !== false ? 'Ativo' : 'Inativo'}
                            </Badge>
                            {mapping.last_synced_at && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(mapping.last_synced_at), "dd/MM HH:mm")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-4">Nenhum colaborador sincronizado</p>
                  <Button 
                    onClick={() => syncUsers()} 
                    disabled={syncingUsers || !status?.connected}
                    variant="outline"
                  >
                    {syncingUsers ? 'Sincronizando...' : 'Iniciar Sincronização'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Sincronização de Calendário</CardTitle>
                  <CardDescription>Eventos sincronizados do Bitrix24</CardDescription>
                </div>
                <Button 
                  onClick={() => syncCalendar()} 
                  disabled={syncingCalendar || !status?.connected}
                  size="sm"
                >
                  {syncingCalendar ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sincronizar Calendário
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {calendarMappings?.length ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {calendarMappings.map((mapping: any) => {
                      const metadata = mapping.metadata as Record<string, any> || {};
                      
                      return (
                        <div 
                          key={mapping.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-purple-500/10">
                              <Calendar className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{metadata.name || `Evento ${mapping.bitrix_id}`}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {metadata.date_from && (
                                  <span>
                                    {format(new Date(metadata.date_from), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                  </span>
                                )}
                                {metadata.date_to && (
                                  <>
                                    <span>→</span>
                                    <span>
                                      {format(new Date(metadata.date_to), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {metadata.type || 'Evento'}
                            </Badge>
                            {mapping.last_synced_at && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(mapping.last_synced_at), "dd/MM HH:mm")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-4">Nenhum evento sincronizado</p>
                  <Button 
                    onClick={() => syncCalendar()} 
                    disabled={syncingCalendar || !status?.connected}
                    variant="outline"
                  >
                    {syncingCalendar ? 'Sincronizando...' : 'Sincronizar Calendário'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-lg">Controle de Jornada</CardTitle>
                <CardDescription>Check-ins e check-outs sincronizados automaticamente com Bitrix24</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-start gap-3">
                  <Timer className="h-5 w-5 text-cyan-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-cyan-700 dark:text-cyan-300">Sincronização Automática</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quando colaboradores fazem check-in/check-out no Task Gifts, o sistema sincroniza automaticamente 
                      com o Timeman do Bitrix24 para os usuários que possuem mapeamento ativo.
                    </p>
                  </div>
                </div>
              </div>

              {attendanceMappings?.length ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {attendanceMappings.map((mapping: any) => {
                      const metadata = mapping.metadata as Record<string, any> || {};
                      const localId = mapping.local_id as string;
                      const datePart = localId.split('_').pop() || '';
                      
                      return (
                        <div 
                          key={mapping.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              mapping.sync_status === 'checked_out' 
                                ? 'bg-green-500/10' 
                                : 'bg-cyan-500/10'
                            }`}>
                              <Timer className={`h-4 w-4 ${
                                mapping.sync_status === 'checked_out' 
                                  ? 'text-green-500' 
                                  : 'text-cyan-500'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {datePart ? format(new Date(datePart), "dd/MM/yyyy", { locale: ptBR }) : 'Data'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {metadata.check_in_at && (
                                  <span>
                                    Entrada: {format(new Date(metadata.check_in_at), "HH:mm")}
                                  </span>
                                )}
                                {metadata.check_out_at && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      Saída: {format(new Date(metadata.check_out_at), "HH:mm")}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={mapping.sync_status === 'checked_out' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {mapping.sync_status === 'checked_out' ? 'Concluído' : 'Trabalhando'}
                            </Badge>
                            {mapping.last_synced_at && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(mapping.last_synced_at), "HH:mm")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Timer className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum registro de jornada sincronizado</p>
                  <p className="text-sm mt-2">Os registros aparecerão quando colaboradores fizerem check-in</p>
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
