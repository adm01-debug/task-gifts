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
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissions } from "@/hooks/usePermissions";
import { LoadingState } from "@/components/ui/loading-state";
import { 
  Shield, Users, Plus, Edit, Trash2, Lock, Unlock, 
  Eye, Settings, BarChart3, MessageSquare, Target,
  FileText, Bell, UserCog, Check, X
} from "lucide-react";

interface PermissionModule {
  id: string;
  name: string;
  icon: React.ReactNode;
  permissions: {
    key: string;
    label: string;
    description: string;
  }[];
}

const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: 'engagement',
    name: 'Engajamento',
    icon: <BarChart3 className="h-4 w-4" />,
    permissions: [
      { key: 'engagement.surveys.view', label: 'Visualizar Pesquisas', description: 'Ver resultados de pesquisas' },
      { key: 'engagement.surveys.create', label: 'Criar Pesquisas', description: 'Criar novas pesquisas de clima' },
      { key: 'engagement.surveys.respond', label: 'Responder Pesquisas', description: 'Participar de pesquisas' },
      { key: 'engagement.opinions.send', label: 'Enviar Opiniões', description: 'Enviar opiniões à liderança' },
      { key: 'engagement.opinions.manage', label: 'Gerenciar Opiniões', description: 'Ver e responder opiniões recebidas' },
      { key: 'engagement.actions.create', label: 'Criar Planos de Ação', description: 'Criar e gerenciar planos FCA' },
    ],
  },
  {
    id: 'talents',
    name: 'Talentos',
    icon: <Users className="h-4 w-4" />,
    permissions: [
      { key: 'talents.evaluations.view', label: 'Ver Avaliações', description: 'Ver resultados de avaliações 360°' },
      { key: 'talents.evaluations.create', label: 'Criar Ciclos', description: 'Criar ciclos de avaliação' },
      { key: 'talents.evaluations.calibrate', label: 'Calibrar', description: 'Participar de calibração' },
      { key: 'talents.feedback.send', label: 'Enviar Feedback', description: 'Enviar feedbacks a colegas' },
      { key: 'talents.feedback.view_all', label: 'Ver Todos Feedbacks', description: 'Ver feedbacks do time' },
      { key: 'talents.pdi.manage', label: 'Gerenciar PDI', description: 'Criar e acompanhar PDIs' },
      { key: 'talents.oneone.schedule', label: 'Agendar 1-on-1', description: 'Agendar reuniões 1-on-1' },
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    icon: <Target className="h-4 w-4" />,
    permissions: [
      { key: 'performance.okrs.view', label: 'Ver OKRs', description: 'Visualizar OKRs da empresa' },
      { key: 'performance.okrs.create', label: 'Criar OKRs', description: 'Criar objetivos e key results' },
      { key: 'performance.okrs.manage_all', label: 'Gerenciar Todos OKRs', description: 'Editar OKRs de qualquer área' },
      { key: 'performance.kpis.view', label: 'Ver KPIs', description: 'Visualizar indicadores' },
      { key: 'performance.kpis.manage', label: 'Gerenciar KPIs', description: 'Criar e editar KPIs' },
    ],
  },
  {
    id: 'people',
    name: 'Pessoas & Grupos',
    icon: <UserCog className="h-4 w-4" />,
    permissions: [
      { key: 'people.view', label: 'Ver Pessoas', description: 'Visualizar lista de colaboradores' },
      { key: 'people.create', label: 'Adicionar Pessoas', description: 'Cadastrar novos colaboradores' },
      { key: 'people.edit', label: 'Editar Pessoas', description: 'Alterar dados de colaboradores' },
      { key: 'people.delete', label: 'Remover Pessoas', description: 'Inativar ou excluir colaboradores' },
      { key: 'groups.manage', label: 'Gerenciar Grupos', description: 'Criar e editar grupos' },
    ],
  },
  {
    id: 'reports',
    name: 'Relatórios',
    icon: <FileText className="h-4 w-4" />,
    permissions: [
      { key: 'reports.view_own', label: 'Ver Próprios', description: 'Ver relatórios pessoais' },
      { key: 'reports.view_team', label: 'Ver do Time', description: 'Ver relatórios do time' },
      { key: 'reports.view_all', label: 'Ver Todos', description: 'Ver relatórios de toda empresa' },
      { key: 'reports.export', label: 'Exportar', description: 'Exportar relatórios em PDF/Excel' },
      { key: 'reports.executive', label: 'Dashboard Executivo', description: 'Acesso ao dashboard executivo' },
    ],
  },
  {
    id: 'admin',
    name: 'Administração',
    icon: <Settings className="h-4 w-4" />,
    permissions: [
      { key: 'admin.settings', label: 'Configurações Gerais', description: 'Alterar configurações do sistema' },
      { key: 'admin.permissions', label: 'Gerenciar Permissões', description: 'Configurar roles e permissões' },
      { key: 'admin.integrations', label: 'Integrações', description: 'Configurar integrações externas' },
      { key: 'admin.audit', label: 'Logs de Auditoria', description: 'Visualizar logs de auditoria' },
      { key: 'admin.full', label: 'Acesso Total', description: 'Todas as permissões do sistema' },
    ],
  },
];

interface RolePermissions {
  [roleId: string]: string[];
}

const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  'admin': ['admin.full'],
  'manager': [
    'engagement.surveys.view', 'engagement.surveys.respond', 'engagement.opinions.manage', 'engagement.actions.create',
    'talents.evaluations.view', 'talents.feedback.send', 'talents.feedback.view_all', 'talents.pdi.manage', 'talents.oneone.schedule',
    'performance.okrs.view', 'performance.okrs.create', 'performance.kpis.view',
    'people.view', 'groups.manage',
    'reports.view_own', 'reports.view_team', 'reports.export',
  ],
  'employee': [
    'engagement.surveys.respond', 'engagement.opinions.send',
    'talents.feedback.send', 'talents.pdi.manage', 'talents.oneone.schedule',
    'performance.okrs.view',
    'people.view',
    'reports.view_own',
  ],
};

export const PermissionsPanel = () => {
  const { roles, permissions, isLoading, assignPermission, removePermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(DEFAULT_ROLE_PERMISSIONS);

  const togglePermission = (roleId: string, permissionKey: string) => {
    const current = rolePermissions[roleId] || [];
    const updated = current.includes(permissionKey)
      ? current.filter(p => p !== permissionKey)
      : [...current, permissionKey];
    setRolePermissions({ ...rolePermissions, [roleId]: updated });
  };

  const hasPermission = (roleId: string, permissionKey: string) => {
    const perms = rolePermissions[roleId] || [];
    return perms.includes(permissionKey) || perms.includes('admin.full');
  };

  if (isLoading) return <LoadingState message="Carregando permissões..." />;

  const mockRoles = [
    { id: 'admin', name: 'Administrador', description: 'Acesso total ao sistema', userCount: 3, color: 'bg-red-500' },
    { id: 'manager', name: 'Gestor', description: 'Gerencia sua equipe', userCount: 15, color: 'bg-blue-500' },
    { id: 'employee', name: 'Colaborador', description: 'Acesso básico', userCount: 132, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" /> Permissões
          </h2>
          <p className="text-muted-foreground">Gerencie grupos de permissões e acessos do sistema</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">Grupos de Permissão</TabsTrigger>
          <TabsTrigger value="matrix">Matriz de Permissões</TabsTrigger>
          <TabsTrigger value="users">Usuários por Role</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateRoleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Criar Grupo
            </Button>
          </div>

          <div className="grid gap-4">
            {mockRoles.map(role => (
              <Card key={role.id} className={selectedRole === role.id ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${role.color}`} />
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <Badge variant="outline">{role.userCount} usuários</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}>
                        <Eye className="h-4 w-4 mr-1" /> {selectedRole === role.id ? 'Ocultar' : 'Ver Permissões'}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </CardHeader>

                {selectedRole === role.id && (
                  <CardContent>
                    <div className="space-y-4">
                      {PERMISSION_MODULES.map(module => (
                        <div key={module.id} className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            {module.icon} {module.name}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {module.permissions.map(perm => (
                              <div
                                key={perm.key}
                                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                                  hasPermission(role.id, perm.key) 
                                    ? 'bg-green-50 border-green-200 dark:bg-green-950' 
                                    : 'bg-muted/50'
                                }`}
                                onClick={() => togglePermission(role.id, perm.key)}
                              >
                                <Checkbox checked={hasPermission(role.id, perm.key)} />
                                <div>
                                  <p className="text-sm font-medium">{perm.label}</p>
                                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Permissões</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Permissão</th>
                    {mockRoles.map(role => (
                      <th key={role.id} className="text-center p-2 font-medium">{role.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_MODULES.map(module => (
                    <>
                      <tr key={module.id} className="bg-muted/50">
                        <td colSpan={mockRoles.length + 1} className="p-2 font-medium flex items-center gap-2">
                          {module.icon} {module.name}
                        </td>
                      </tr>
                      {module.permissions.map(perm => (
                        <tr key={perm.key} className="border-b">
                          <td className="p-2 pl-6">{perm.label}</td>
                          {mockRoles.map(role => (
                            <td key={role.id} className="text-center p-2">
                              {hasPermission(role.id, perm.key) ? (
                                <Check className="h-4 w-4 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4">
            {mockRoles.map(role => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${role.color}`} />
                      {role.name}
                    </CardTitle>
                    <Badge>{role.userCount} usuários</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {role.id === 'admin' && (
                      <>
                        <Badge variant="secondary">CEO</Badge>
                        <Badge variant="secondary">CTO</Badge>
                        <Badge variant="secondary">Head de RH</Badge>
                      </>
                    )}
                    {role.id === 'manager' && (
                      <>
                        <Badge variant="secondary">João Santos</Badge>
                        <Badge variant="secondary">Maria Costa</Badge>
                        <Badge variant="secondary">Pedro Lima</Badge>
                        <Badge variant="outline">+12 mais</Badge>
                      </>
                    )}
                    {role.id === 'employee' && (
                      <span className="text-sm text-muted-foreground">132 colaboradores com este perfil</span>
                    )}
                  </div>
                  <Button variant="link" size="sm" className="mt-2 p-0">
                    <Users className="h-4 w-4 mr-1" /> Ver todos os usuários
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={showCreateRoleDialog} onOpenChange={setShowCreateRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Grupo de Permissão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Grupo</Label>
              <Input placeholder="Ex: Analista de RH" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input placeholder="Breve descrição do grupo" />
            </div>
            <div className="space-y-2">
              <Label>Copiar permissões de</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Começar do zero</SelectItem>
                  <SelectItem value="employee">Colaborador</SelectItem>
                  <SelectItem value="manager">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateRoleDialog(false)}>Cancelar</Button>
              <Button>Criar Grupo</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
