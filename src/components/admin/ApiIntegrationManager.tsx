import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Key, Webhook, Activity, Copy, RefreshCw, Trash2, Eye, EyeOff, Check, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  useApiKeys,
  useCreateApiKey,
  useUpdateApiKey,
  useDeleteApiKey,
  useRegenerateApiSecret,
  useWebhookSubscriptions,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useApiRequestLogs,
  useWebhookDeliveryLogs,
  useExternalTasks,
  useExternalTaskStats,
  useAvailableEvents,
  useSystemTypes,
  useAvailablePermissions
} from "@/hooks/useExternalApi";
import { ExternalApiKey, WebhookSubscription } from "@/services/externalApiService";

export const ApiIntegrationManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("keys");
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ExternalApiKey | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Data hooks
  const { data: apiKeys = [], isLoading: loadingKeys } = useApiKeys();
  const { data: webhooks = [] } = useWebhookSubscriptions();
  const { data: apiLogs = [] } = useApiRequestLogs(undefined, 50);
  const { data: webhookLogs = [] } = useWebhookDeliveryLogs(undefined, 50);
  const { data: externalTasks = [] } = useExternalTasks({}, 50);
  const { data: taskStats } = useExternalTaskStats();

  // Mutations
  const createApiKey = useCreateApiKey();
  const updateApiKey = useUpdateApiKey();
  const deleteApiKey = useDeleteApiKey();
  const regenerateSecret = useRegenerateApiSecret();
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();

  // Form data
  const systemTypes = useSystemTypes();
  const availablePermissions = useAvailablePermissions();
  const availableEvents = useAvailableEvents();

  // Form states
  const [apiKeyForm, setApiKeyForm] = useState({
    name: "",
    description: "",
    system_type: "generic",
    permissions: ["read"] as string[],
    rate_limit_per_minute: 60
  });

  const [webhookForm, setWebhookForm] = useState({
    api_key_id: "",
    name: "",
    url: "",
    events: [] as string[]
  });

  const handleCreateApiKey = async () => {
    if (!apiKeyForm.name || !user?.id) return;

    await createApiKey.mutateAsync({
      name: apiKeyForm.name,
      description: apiKeyForm.description || null,
      systemType: apiKeyForm.system_type,
      permissions: apiKeyForm.permissions,
      rateLimitPerMinute: apiKeyForm.rate_limit_per_minute,
      createdBy: user.id
    });

    setIsApiKeyDialogOpen(false);
    setApiKeyForm({
      name: "",
      description: "",
      system_type: "generic",
      permissions: ["read"],
      rate_limit_per_minute: 60
    });
  };

  const handleCreateWebhook = async () => {
    if (!webhookForm.name || !webhookForm.url || !webhookForm.api_key_id) return;

    await createWebhook.mutateAsync({
      apiKeyId: webhookForm.api_key_id,
      name: webhookForm.name,
      url: webhookForm.url,
      events: webhookForm.events
    });

    setIsWebhookDialogOpen(false);
    setWebhookForm({ api_key_id: "", name: "", url: "", events: [] });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência`);
  };

  const toggleSecret = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePermission = (permission: string) => {
    setApiKeyForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const toggleEvent = (event: string) => {
    setWebhookForm(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const getStatusBadge = (status: number | null) => {
    if (!status) return <Badge variant="secondary">-</Badge>;
    if (status >= 200 && status < 300) return <Badge className="bg-green-500">{status}</Badge>;
    if (status >= 400 && status < 500) return <Badge variant="destructive">{status}</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiBaseUrl = `${supabaseUrl}/functions/v1/external-api`;
  const webhookUrl = `${supabaseUrl}/functions/v1/external-webhook`;

  return (
    <div className="space-y-6">
      {/* Header with API URL */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API de Integração Externa
          </CardTitle>
          <CardDescription>
            Integre sistemas externos (Financeiro, Fabricação, etc.) com o TaskGifts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">REST API Endpoint</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                  {apiBaseUrl}
                </code>
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(apiBaseUrl, "URL da API")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Webhook Endpoint</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                  {webhookUrl}
                </code>
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(webhookUrl, "URL do Webhook")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {taskStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{taskStats.total}</div>
                <div className="text-xs text-muted-foreground">Total Tarefas</div>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                <div className="text-xs text-muted-foreground">Concluídas</div>
              </div>
              <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{taskStats.late}</div>
                <div className="text-xs text-muted-foreground">Atrasadas</div>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{taskStats.rejected}</div>
                <div className="text-xs text-muted-foreground">Rejeitadas</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Activity className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Tarefas
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar API Key</DialogTitle>
                  <DialogDescription>Configure credenciais para um sistema externo</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome do Sistema *</Label>
                    <Input
                      value={apiKeyForm.name}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
                      placeholder="Ex: Sistema Financeiro"
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={apiKeyForm.description}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, description: e.target.value })}
                      placeholder="Descrição do sistema..."
                    />
                  </div>
                  <div>
                    <Label>Tipo de Sistema</Label>
                    <Select
                      value={apiKeyForm.system_type}
                      onValueChange={(v) => setApiKeyForm({ ...apiKeyForm, system_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {systemTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Permissões</Label>
                    <div className="space-y-2 mt-2">
                      {availablePermissions.map((perm) => (
                        <div key={perm.value} className="flex items-center gap-2">
                          <Checkbox
                            checked={apiKeyForm.permissions.includes(perm.value)}
                            onCheckedChange={() => togglePermission(perm.value)}
                          />
                          <div>
                            <span className="font-medium">{perm.label}</span>
                            <p className="text-xs text-muted-foreground">{perm.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Rate Limit (req/min)</Label>
                    <Input
                      type="number"
                      value={apiKeyForm.rate_limit_per_minute}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, rate_limit_per_minute: parseInt(e.target.value) || 60 })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateApiKey} disabled={createApiKey.isPending}>
                    Criar API Key
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <AnimatePresence mode="popLayout">
            {apiKeys.map((key) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${key.is_active ? 'bg-green-500/10' : 'bg-muted'}`}>
                          <Key className={`h-5 w-5 ${key.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{key.name}</CardTitle>
                          <CardDescription>{key.description || key.system_type}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={key.is_active}
                          onCheckedChange={(checked) => updateApiKey.mutate({ id: key.id, updates: { is_active: checked } })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => regenerateSecret.mutate(key.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteApiKey.mutate(key.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">API Key</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 bg-muted px-2 py-1 rounded text-xs font-mono">
                            {key.api_key}
                          </code>
                          <Button size="icon" variant="ghost" onClick={() => copyToClipboard(key.api_key, "API Key")}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">API Secret</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 bg-muted px-2 py-1 rounded text-xs font-mono">
                            {showSecrets[key.id] ? key.api_secret : '••••••••••••••••••••'}
                          </code>
                          <Button size="icon" variant="ghost" onClick={() => toggleSecret(key.id)}>
                            {showSecrets[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => copyToClipboard(key.api_secret, "API Secret")}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {key.permissions.map((p) => (
                        <Badge key={p} variant="secondary">{p}</Badge>
                      ))}
                      <Badge variant="outline">{key.rate_limit_per_minute} req/min</Badge>
                      {key.last_used_at && (
                        <Badge variant="outline" className="text-xs">
                          Último uso: {format(new Date(key.last_used_at), "dd/MM HH:mm", { locale: ptBR })}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {apiKeys.length === 0 && !loadingKeys && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhuma API Key criada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie uma API Key para permitir que sistemas externos se conectem
                </p>
                <Button onClick={() => setIsApiKeyDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira API Key
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" disabled={apiKeys.length === 0}>
                  <Plus className="h-4 w-4" />
                  Novo Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Webhook</DialogTitle>
                  <DialogDescription>Receba notificações de eventos no seu sistema</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Sistema (API Key) *</Label>
                    <Select
                      value={webhookForm.api_key_id}
                      onValueChange={(v) => setWebhookForm({ ...webhookForm, api_key_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o sistema" />
                      </SelectTrigger>
                      <SelectContent>
                        {apiKeys.filter(k => k.is_active).map((key) => (
                          <SelectItem key={key.id} value={key.id}>
                            {key.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nome do Webhook *</Label>
                    <Input
                      value={webhookForm.name}
                      onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                      placeholder="Ex: Notificações de Tarefas"
                    />
                  </div>
                  <div>
                    <Label>URL do Webhook *</Label>
                    <Input
                      value={webhookForm.url}
                      onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                      placeholder="https://seu-sistema.com/webhook"
                    />
                  </div>
                  <div>
                    <Label>Eventos para notificar</Label>
                    <ScrollArea className="h-48 border rounded-md p-2 mt-2">
                      <div className="space-y-2">
                        {availableEvents.map((event) => (
                          <div key={event.value} className="flex items-start gap-2">
                            <Checkbox
                              checked={webhookForm.events.includes(event.value)}
                              onCheckedChange={() => toggleEvent(event.value)}
                            />
                            <div>
                              <span className="font-medium text-sm">{event.label}</span>
                              <p className="text-xs text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsWebhookDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateWebhook} disabled={createWebhook.isPending}>
                    Criar Webhook
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <AnimatePresence mode="popLayout">
            {webhooks.map((webhook) => (
              <motion.div
                key={webhook.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${webhook.is_active ? 'bg-blue-500/10' : 'bg-muted'}`}>
                          <Webhook className={`h-5 w-5 ${webhook.is_active ? 'text-blue-500' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{webhook.name}</CardTitle>
                          <CardDescription className="truncate max-w-md">{webhook.url}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(webhook.last_status)}
                        <Switch
                          checked={webhook.is_active}
                          onCheckedChange={(checked) => updateWebhook.mutate({ id: webhook.id, updates: { is_active: checked } })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteWebhook.mutate(webhook.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="secondary">{event}</Badge>
                      ))}
                    </div>
                    {webhook.last_triggered_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Último disparo: {format(new Date(webhook.last_triggered_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {webhooks.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhum Webhook configurado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure webhooks para receber notificações de eventos
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Últimas Requisições API</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            <span className="text-muted-foreground">{log.method}</span> {log.endpoint}
                          </TableCell>
                          <TableCell>{getStatusBadge(log.response_status)}</TableCell>
                          <TableCell>{log.duration_ms}ms</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "dd/MM HH:mm")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Últimos Webhooks Enviados</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Evento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tentativas</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhookLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">{log.event_type}</TableCell>
                          <TableCell>
                            {log.success ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-destructive" />
                            )}
                          </TableCell>
                          <TableCell>{log.attempt_count}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "dd/MM HH:mm")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* External Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tarefas de Sistemas Externos</CardTitle>
              <CardDescription>Tarefas recebidas via API de sistemas integrados</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sistema</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Criada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {externalTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Badge variant="outline">{task.external_system}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{task.title}</TableCell>
                        <TableCell className="text-xs">{task.user_email}</TableCell>
                        <TableCell>
                          <Badge className={
                            task.status === 'on_time' ? 'bg-green-500' :
                            task.status === 'pending' ? 'bg-yellow-500' :
                            task.status === 'late' ? 'bg-orange-500' :
                            'bg-red-500'
                          }>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.xp_reward} XP</TableCell>
                        <TableCell className="text-xs">
                          {task.deadline_at ? format(new Date(task.deadline_at), "dd/MM HH:mm") : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(task.created_at), "dd/MM HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Documentation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documentação Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Autenticação</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Inclua os headers em todas as requisições:
              </p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`x-api-key: sua_api_key
x-api-secret: seu_api_secret`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Criar Tarefa (POST /tasks)</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "external_id": "TASK-001",
  "user_email": "user@empresa.com",
  "title": "Tarefa do Sistema",
  "xp_reward": 100,
  "deadline_at": "2024-12-31T23:59:59Z"
}`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Completar Tarefa (POST /tasks/{'{id}'}/complete)</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "status": "on_time"  // ou "late", "rework", "rejected"
}`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Webhook Payload (Enviado)</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "event": "task.completed",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": { ... }
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
