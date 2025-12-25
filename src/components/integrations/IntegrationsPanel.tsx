import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Key, Webhook, Shield, Plus, Copy, Eye, EyeOff, 
  RefreshCw, Trash2, ExternalLink, Clock, CheckCircle,
  AlertTriangle, Code, Settings, Play, History
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created_at: string;
  last_used?: string;
  is_active: boolean;
  rate_limit: number;
  expires_at?: string;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret: string;
  created_at: string;
  last_triggered?: string;
  success_count: number;
  failure_count: number;
}

interface WebhookLog {
  id: string;
  webhook_id: string;
  event: string;
  status: "success" | "failed" | "pending";
  response_code?: number;
  payload: string;
  created_at: string;
  duration_ms?: number;
}

const AVAILABLE_EVENTS = [
  { value: "survey.created", label: "Pesquisa criada" },
  { value: "survey.completed", label: "Pesquisa respondida" },
  { value: "feedback.sent", label: "Feedback enviado" },
  { value: "okr.updated", label: "OKR atualizado" },
  { value: "checkin.completed", label: "1-on-1 concluído" },
  { value: "user.created", label: "Usuário criado" },
  { value: "user.updated", label: "Usuário atualizado" },
  { value: "kpi.alert", label: "Alerta de KPI" },
];

const API_PERMISSIONS = [
  { value: "read:users", label: "Ler usuários" },
  { value: "write:users", label: "Criar/editar usuários" },
  { value: "read:surveys", label: "Ler pesquisas" },
  { value: "write:surveys", label: "Criar pesquisas" },
  { value: "read:feedback", label: "Ler feedbacks" },
  { value: "write:feedback", label: "Enviar feedbacks" },
  { value: "read:okrs", label: "Ler OKRs" },
  { value: "write:okrs", label: "Criar/editar OKRs" },
  { value: "read:reports", label: "Ler relatórios" },
  { value: "admin:full", label: "Acesso total (Admin)" },
];

export const IntegrationsPanel = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Produção - Dashboard BI",
      key: "tc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      permissions: ["read:users", "read:surveys", "read:reports"],
      created_at: "2024-01-15",
      last_used: "2024-12-25 14:30",
      is_active: true,
      rate_limit: 1000,
    },
    {
      id: "2",
      name: "Integração RH",
      key: "tc_live_yyyyyyyyyyyyyyyyyyyyyyyyyyyy",
      permissions: ["read:users", "write:users"],
      created_at: "2024-06-20",
      last_used: "2024-12-24 09:15",
      is_active: true,
      rate_limit: 500,
    },
  ]);

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      name: "Slack Notifications",
      url: "https://hooks.slack.com/services/xxx/yyy/zzz",
      events: ["survey.completed", "feedback.sent"],
      is_active: true,
      secret: "whsec_xxxxxxxxxxxx",
      created_at: "2024-03-10",
      last_triggered: "2024-12-25 15:00",
      success_count: 1234,
      failure_count: 12,
    },
  ]);

  const [webhookLogs] = useState<WebhookLog[]>([
    {
      id: "1",
      webhook_id: "1",
      event: "survey.completed",
      status: "success",
      response_code: 200,
      payload: '{"event":"survey.completed","user_id":"123"}',
      created_at: "2024-12-25 15:00",
      duration_ms: 245,
    },
    {
      id: "2",
      webhook_id: "1",
      event: "feedback.sent",
      status: "failed",
      response_code: 500,
      payload: '{"event":"feedback.sent","from":"user1"}',
      created_at: "2024-12-25 14:30",
      duration_ms: 1200,
    },
  ]);

  const [showKey, setShowKey] = useState<string | null>(null);
  const [newApiKeyDialog, setNewApiKeyDialog] = useState(false);
  const [newWebhookDialog, setNewWebhookDialog] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const [newApiKey, setNewApiKey] = useState({
    name: "",
    rate_limit: 1000,
    expires_days: 0,
  });

  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
  });

  const generateApiKey = () => {
    if (!newApiKey.name || selectedPermissions.length === 0) {
      toast.error("Preencha nome e selecione permissões");
      return;
    }

    const key: ApiKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      key: `tc_live_${Math.random().toString(36).substring(2, 34)}`,
      permissions: selectedPermissions,
      created_at: new Date().toISOString().split("T")[0],
      is_active: true,
      rate_limit: newApiKey.rate_limit,
      expires_at: newApiKey.expires_days > 0 
        ? new Date(Date.now() + newApiKey.expires_days * 86400000).toISOString()
        : undefined,
    };

    setApiKeys([...apiKeys, key]);
    setNewApiKeyDialog(false);
    setNewApiKey({ name: "", rate_limit: 1000, expires_days: 0 });
    setSelectedPermissions([]);
    toast.success("Chave API criada com sucesso!");
  };

  const createWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || selectedEvents.length === 0) {
      toast.error("Preencha todos os campos");
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: selectedEvents,
      is_active: true,
      secret: `whsec_${Math.random().toString(36).substring(2, 20)}`,
      created_at: new Date().toISOString().split("T")[0],
      success_count: 0,
      failure_count: 0,
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhookDialog(false);
    setNewWebhook({ name: "", url: "" });
    setSelectedEvents([]);
    toast.success("Webhook configurado!");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const toggleApiKey = (id: string) => {
    setApiKeys(apiKeys.map(k => 
      k.id === id ? { ...k, is_active: !k.is_active } : k
    ));
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    toast.success("Chave revogada");
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(webhooks.map(w => 
      w.id === id ? { ...w, is_active: !w.is_active } : w
    ));
  };

  const testWebhook = (webhook: WebhookConfig) => {
    toast.info(`Enviando teste para ${webhook.name}...`);
    setTimeout(() => toast.success("Webhook testado com sucesso!"), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integrações</h2>
          <p className="text-muted-foreground">
            Gerencie APIs, webhooks e integrações externas
          </p>
        </div>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="h-4 w-4" />
            Chaves API
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <Code className="h-4 w-4" />
            Documentação
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Chaves para acessar a API programaticamente
            </p>
            <Dialog open={newApiKeyDialog} onOpenChange={setNewApiKeyDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Chave API
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Criar Chave API</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome da Chave *</Label>
                    <Input
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                      placeholder="Ex: Dashboard BI Produção"
                    />
                  </div>

                  <div>
                    <Label>Permissões *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                      {API_PERMISSIONS.map((perm) => (
                        <label key={perm.value} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPermissions([...selectedPermissions, perm.value]);
                              } else {
                                setSelectedPermissions(selectedPermissions.filter(p => p !== perm.value));
                              }
                            }}
                            className="rounded"
                          />
                          {perm.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Rate Limit (req/hora)</Label>
                      <Input
                        type="number"
                        value={newApiKey.rate_limit}
                        onChange={(e) => setNewApiKey({ ...newApiKey, rate_limit: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Expira em (dias, 0=nunca)</Label>
                      <Input
                        type="number"
                        value={newApiKey.expires_days}
                        onChange={(e) => setNewApiKey({ ...newApiKey, expires_days: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <Button onClick={generateApiKey} className="w-full">
                    Gerar Chave API
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{apiKey.name}</span>
                        <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                          {apiKey.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {showKey === apiKey.id ? apiKey.key : apiKey.key.replace(/./g, "•").slice(0, 20) + "..."}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                        >
                          {showKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Criada: {apiKey.created_at}</span>
                        {apiKey.last_used && <span>Último uso: {apiKey.last_used}</span>}
                        <span>Limite: {apiKey.rate_limit} req/h</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={apiKey.is_active}
                        onCheckedChange={() => toggleApiKey(apiKey.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteApiKey(apiKey.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Receba notificações em tempo real sobre eventos
            </p>
            <Dialog open={newWebhookDialog} onOpenChange={setNewWebhookDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Configurar Webhook</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome *</Label>
                    <Input
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                      placeholder="Ex: Slack Notifications"
                    />
                  </div>

                  <div>
                    <Label>URL do Endpoint *</Label>
                    <Input
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label>Eventos *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {AVAILABLE_EVENTS.map((event) => (
                        <label key={event.value} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedEvents.includes(event.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEvents([...selectedEvents, event.value]);
                              } else {
                                setSelectedEvents(selectedEvents.filter(ev => ev !== event.value));
                              }
                            }}
                            className="rounded"
                          />
                          {event.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button onClick={createWebhook} className="w-full">
                    Criar Webhook
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{webhook.name}</span>
                        <Badge variant={webhook.is_active ? "default" : "secondary"}>
                          {webhook.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      <code className="text-sm text-muted-foreground block">
                        {webhook.url}
                      </code>

                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {webhook.success_count} sucessos
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                          {webhook.failure_count} falhas
                        </span>
                        {webhook.last_triggered && (
                          <span>Último: {webhook.last_triggered}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testWebhook(webhook)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={webhook.is_active}
                        onCheckedChange={() => toggleWebhook(webhook.id)}
                      />
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Logs de Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {webhookLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {log.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{log.event}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.created_at} • {log.duration_ms}ms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status === "success" ? "default" : "destructive"}>
                        {log.response_code}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Ver Payload
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Docs Tab */}
        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5" />
                Documentação da API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium mb-2">Base URL</p>
                <code className="text-sm">https://api.teamculture.com/v1</code>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Autenticação</p>
                <p className="text-sm text-muted-foreground">
                  Inclua sua chave API no header de todas as requisições:
                </p>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`Authorization: Bearer tc_live_sua_chave_aqui`}
                </pre>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Endpoints Disponíveis</p>
                <div className="space-y-1 text-sm">
                  <p><Badge variant="outline" className="mr-2">GET</Badge>/users - Listar usuários</p>
                  <p><Badge variant="outline" className="mr-2">POST</Badge>/users - Criar usuário</p>
                  <p><Badge variant="outline" className="mr-2">GET</Badge>/surveys - Listar pesquisas</p>
                  <p><Badge variant="outline" className="mr-2">GET</Badge>/feedback - Listar feedbacks</p>
                  <p><Badge variant="outline" className="mr-2">GET</Badge>/okrs - Listar OKRs</p>
                  <p><Badge variant="outline" className="mr-2">GET</Badge>/reports/enps - Relatório eNPS</p>
                </div>
              </div>

              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Ver Documentação Completa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
