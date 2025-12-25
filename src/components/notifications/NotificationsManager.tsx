import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNotifications } from "@/hooks/useNotifications";
import { LoadingState } from "@/components/ui/loading-state";
import { 
  Bell, Mail, MessageSquare, Smartphone, Plus, Edit, Trash2,
  Clock, Users, AlertTriangle, CheckCircle2, Send, Eye
} from "lucide-react";

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'push' | 'in_app' | 'slack';
  trigger: string;
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
}

const mockTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Nova Pesquisa Disponível',
    type: 'email',
    trigger: 'survey.created',
    subject: '📊 Nova pesquisa de clima disponível!',
    content: 'Olá {{nome}}, uma nova pesquisa está disponível para você responder até {{prazo}}.',
    variables: ['nome', 'prazo', 'link'],
    is_active: true,
  },
  {
    id: '2',
    name: 'Lembrete de Pesquisa',
    type: 'push',
    trigger: 'survey.reminder',
    content: 'Faltam {{dias}} dias para responder a pesquisa de clima!',
    variables: ['dias', 'titulo'],
    is_active: true,
  },
  {
    id: '3',
    name: 'Feedback Recebido',
    type: 'in_app',
    trigger: 'feedback.received',
    content: 'Você recebeu um novo feedback de {{remetente}}!',
    variables: ['remetente', 'tipo'],
    is_active: true,
  },
  {
    id: '4',
    name: 'Lembrete 1-on-1',
    type: 'slack',
    trigger: 'oneone.reminder',
    content: 'Sua 1-on-1 com {{colaborador}} está agendada para {{data}} às {{hora}}.',
    variables: ['colaborador', 'data', 'hora'],
    is_active: true,
  },
];

interface NotificationLog {
  id: string;
  template_id: string;
  template_name: string;
  type: 'email' | 'push' | 'in_app' | 'slack';
  recipient: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at: string;
  opened_at?: string;
}

const mockLogs: NotificationLog[] = [
  { id: '1', template_id: '1', template_name: 'Nova Pesquisa Disponível', type: 'email', recipient: 'maria@empresa.com', status: 'sent', sent_at: new Date().toISOString(), opened_at: new Date().toISOString() },
  { id: '2', template_id: '2', template_name: 'Lembrete de Pesquisa', type: 'push', recipient: 'joao@empresa.com', status: 'sent', sent_at: new Date().toISOString() },
  { id: '3', template_id: '3', template_name: 'Feedback Recebido', type: 'in_app', recipient: 'pedro@empresa.com', status: 'sent', sent_at: new Date().toISOString() },
  { id: '4', template_id: '1', template_name: 'Nova Pesquisa Disponível', type: 'email', recipient: 'ana@empresa.com', status: 'failed', sent_at: new Date().toISOString() },
];

export const NotificationsManager = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as NotificationTemplate['type'],
    trigger: '',
    subject: '',
    content: '',
    is_active: true,
  });

  const getTypeIcon = (type: NotificationTemplate['type']) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'push': return <Smartphone className="h-4 w-4" />;
      case 'in_app': return <Bell className="h-4 w-4" />;
      case 'slack': return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: NotificationTemplate['type']) => {
    switch (type) {
      case 'email': return 'Email';
      case 'push': return 'Push';
      case 'in_app': return 'In-App';
      case 'slack': return 'Slack';
    }
  };

  const getStatusBadge = (status: NotificationLog['status']) => {
    switch (status) {
      case 'sent': return <Badge className="bg-green-500">Enviado</Badge>;
      case 'failed': return <Badge variant="destructive">Falhou</Badge>;
      case 'pending': return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const triggers = [
    { value: 'survey.created', label: 'Pesquisa criada' },
    { value: 'survey.reminder', label: 'Lembrete de pesquisa' },
    { value: 'survey.completed', label: 'Pesquisa respondida' },
    { value: 'feedback.received', label: 'Feedback recebido' },
    { value: 'feedback.requested', label: 'Feedback solicitado' },
    { value: 'evaluation.started', label: 'Ciclo de avaliação iniciado' },
    { value: 'evaluation.due', label: 'Avaliação pendente' },
    { value: 'pdi.created', label: 'PDI criado' },
    { value: 'pdi.review', label: 'Revisão de PDI' },
    { value: 'oneone.scheduled', label: '1-on-1 agendada' },
    { value: 'oneone.reminder', label: 'Lembrete de 1-on-1' },
    { value: 'okr.update', label: 'OKR atualizado' },
    { value: 'okr.due', label: 'OKR vencendo' },
    { value: 'celebration.birthday', label: 'Aniversário' },
    { value: 'celebration.anniversary', label: 'Aniversário de empresa' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" /> Notificações
          </h2>
          <p className="text-muted-foreground">Gerencie templates e configurações de notificações</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{mockLogs.filter(l => l.status === 'sent').length}</p>
            <p className="text-sm text-muted-foreground">Enviadas hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{mockLogs.filter(l => l.status === 'failed').length}</p>
            <p className="text-sm text-muted-foreground">Falhas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{mockTemplates.filter(t => t.is_active).length}</p>
            <p className="text-sm text-muted-foreground">Templates ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">75%</p>
            <p className="text-sm text-muted-foreground">Taxa de abertura</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Histórico</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowTemplateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Criar Template
            </Button>
          </div>

          <div className="grid gap-4">
            {mockTemplates.map(template => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(template.type)}
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline">{getTypeLabel(template.type)}</Badge>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingTemplate(template);
                        setFormData({
                          name: template.name,
                          type: template.type,
                          trigger: template.trigger,
                          subject: template.subject || '',
                          content: template.content,
                          is_active: template.is_active,
                        });
                        setShowTemplateDialog(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Gatilho:</span> {triggers.find(t => t.value === template.trigger)?.label}</p>
                    {template.subject && <p><span className="text-muted-foreground">Assunto:</span> {template.subject}</p>}
                    <p><span className="text-muted-foreground">Conteúdo:</span> {template.content}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-muted-foreground">Variáveis:</span>
                      {template.variables.map(v => (
                        <Badge key={v} variant="outline" className="text-xs">{'{{' + v + '}}'}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center gap-4">
            <Input placeholder="Buscar por destinatário..." className="max-w-sm" />
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="in_app">In-App</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="sent">Enviados</SelectItem>
                <SelectItem value="failed">Falhas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Template</th>
                    <th className="text-left p-3">Tipo</th>
                    <th className="text-left p-3">Destinatário</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Enviado em</th>
                    <th className="text-left p-3">Aberto</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLogs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{log.template_name}</td>
                      <td className="p-3 flex items-center gap-2">
                        {getTypeIcon(log.type)} {getTypeLabel(log.type)}
                      </td>
                      <td className="p-3">{log.recipient}</td>
                      <td className="p-3">{getStatusBadge(log.status)}</td>
                      <td className="p-3">{new Date(log.sent_at).toLocaleString('pt-BR')}</td>
                      <td className="p-3">
                        {log.opened_at ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Canais de Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">Notificações via email corporativo</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Notificações no navegador/app</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  <div>
                    <p className="font-medium">In-App</p>
                    <p className="text-sm text-muted-foreground">Notificações dentro da plataforma</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Slack</p>
                    <p className="text-sm text-muted-foreground">Integração com Slack</p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horários de Envio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início do horário comercial</Label>
                  <Input type="time" defaultValue="09:00" />
                </div>
                <div className="space-y-2">
                  <Label>Fim do horário comercial</Label>
                  <Input type="time" defaultValue="18:00" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Respeitar horário comercial</p>
                  <p className="text-sm text-muted-foreground">Não enviar fora do expediente</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Respeitar fuso horário do usuário</p>
                  <p className="text-sm text-muted-foreground">Ajustar envio por timezone</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={(open) => {
        setShowTemplateDialog(open);
        if (!open) setEditingTemplate(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Editar' : 'Criar'} Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Template</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Lembrete de Pesquisa"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as NotificationTemplate['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gatilho</Label>
                <Select
                  value={formData.trigger}
                  onValueChange={(v) => setFormData({ ...formData, trigger: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggers.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.type === 'email' && (
              <div className="space-y-2">
                <Label>Assunto</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex: Nova pesquisa disponível!"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Use {{variavel}} para inserir dados dinâmicos"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Variáveis disponíveis: {'{{nome}}'}, {'{{email}}'}, {'{{data}}'}, {'{{link}}'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label>Template ativo</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancelar</Button>
              <Button>{editingTemplate ? 'Salvar' : 'Criar Template'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
