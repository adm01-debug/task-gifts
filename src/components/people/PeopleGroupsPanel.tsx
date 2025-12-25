import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { usePeople, useGroups, usePersonDetail, useGroupDetail } from "@/hooks/usePeopleGroups";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { 
  Search, Plus, Users, Building2, UserPlus, FileUp, Download,
  Settings, Mail, Phone, Calendar, Briefcase, Shield, Eye,
  ChevronRight, UserX, UserCheck, Edit, Trash2
} from "lucide-react";
import type { Person, Group } from "@/services/peopleService";

// People List Component
const PeopleList = () => {
  const { people, stats, isLoading, getStatusIcon, getStatusLabel, updateStatus, createPerson } = usePeople();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const filteredPeople = people.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <LoadingState message="Carregando pessoas..." />;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            <p className="text-sm text-muted-foreground">✅ Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.invited}</p>
            <p className="text-sm text-muted-foreground">📧 Convidados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.inactive}</p>
            <p className="text-sm text-muted-foreground">⏸️ Inativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.deleted}</p>
            <p className="text-sm text-muted-foreground">🗑️ Excluídos</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, CPF, matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="confirmed">Ativos</SelectItem>
            <SelectItem value="invited">Convidados</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Pessoa
        </Button>
        <Button variant="outline">
          <FileUp className="h-4 w-4 mr-2" /> Importar CSV
        </Button>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* People Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Departamento</th>
                <th className="text-left p-3 font-medium">Cargo</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Nenhuma pessoa encontrada
                  </td>
                </tr>
              ) : (
                filteredPeople.map(person => (
                  <tr key={person.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{person.name}</td>
                    <td className="p-3 text-muted-foreground">{person.email}</td>
                    <td className="p-3">{person.department_name}</td>
                    <td className="p-3">{person.position}</td>
                    <td className="p-3">
                      <Badge variant={person.status === 'confirmed' ? 'default' : person.status === 'inactive' ? 'secondary' : 'outline'}>
                        {getStatusIcon(person.status)} {getStatusLabel(person.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedPerson(person)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Person Dialog */}
      <AddPersonDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      {/* Person Detail Dialog */}
      <PersonDetailDialog person={selectedPerson} open={!!selectedPerson} onOpenChange={(open) => !open && setSelectedPerson(null)} />
    </div>
  );
};

// Add Person Dialog
const AddPersonDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { createPerson } = usePeople();
  const { groups } = useGroups();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    personal_email: '',
    phone: '',
    cpf: '',
    employee_id: '',
    birth_date: '',
    hire_date: '',
    position: '',
    department_id: '',
    manager_id: '',
    contract_type: 'clt' as Person['contract_type'],
    groups: [] as string[],
    permission_group: 'Colaborador Padrão',
    sendWelcome: true,
    sendInvite: true,
  });

  const handleSubmit = () => {
    createPerson({
      ...formData,
      status: 'invited',
      demographics: {},
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Pessoa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📋 Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Corporativo *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Pessoal</Label>
                  <Input
                    type="email"
                    value={formData.personal_email}
                    onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 98765-4321"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">💼 Dados Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cargo *</Label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departamento *</Label>
                  <Select
                    value={formData.department_id}
                    onValueChange={(v) => setFormData({ ...formData, department_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.filter(g => g.type === 'department').map(g => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data de Admissão *</Label>
                  <Input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Contrato</Label>
                  <Select
                    value={formData.contract_type}
                    onValueChange={(v) => setFormData({ ...formData, contract_type: v as Person['contract_type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clt">CLT</SelectItem>
                      <SelectItem value="pj">PJ</SelectItem>
                      <SelectItem value="intern">Estágio</SelectItem>
                      <SelectItem value="temp">Temporário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Enviar email de boas-vindas</Label>
              <Switch
                checked={formData.sendWelcome}
                onCheckedChange={(c) => setFormData({ ...formData, sendWelcome: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enviar convite para acessar plataforma</Label>
              <Switch
                checked={formData.sendInvite}
                onCheckedChange={(c) => setFormData({ ...formData, sendInvite: c })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar e Convidar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Person Detail Dialog
const PersonDetailDialog = ({ person, open, onOpenChange }: { person: Person | null; open: boolean; onOpenChange: (open: boolean) => void }) => {
  if (!person) return null;

  const tenure = person.hire_date ? Math.floor((Date.now() - new Date(person.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {person.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold">{person.name}</h3>
              <p className="text-sm text-muted-foreground">{person.position}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📋 Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2">{person.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className="ml-2">{person.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">CPF:</span>
                  <span className="ml-2">{person.cpf || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Matrícula:</span>
                  <span className="ml-2">{person.employee_id || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Admissão:</span>
                  <span className="ml-2">{person.hire_date ? new Date(person.hire_date).toLocaleDateString('pt-BR') : '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tempo de Casa:</span>
                  <span className="ml-2">{tenure} anos</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Departamento:</span>
                  <span className="ml-2">{person.department_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Gestor:</span>
                  <span className="ml-2">{person.manager_name || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">👥 Grupos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {person.groups.length > 0 ? (
                  person.groups.map(g => (
                    <Badge key={g} variant="secondary">{g}</Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">Nenhum grupo</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">🔐 Permissões</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Grupo de Permissões: <strong>{person.permission_group}</strong></p>
            </CardContent>
          </Card>

          {Object.keys(person.demographics).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">📊 Atributos Demográficos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {Object.entries(person.demographics).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="ml-2">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" /> Editar
            </Button>
            <Button variant="outline">Alterar Status</Button>
            <Button variant="outline">Histórico</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Groups List Component  
const GroupsList = () => {
  const { groups, hierarchy, isLoading, getTypeIcon, getTypeLabel, createGroup } = useGroups();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'list'>('hierarchy');

  if (isLoading) return <LoadingState message="Carregando grupos..." />;

  const renderHierarchy = (parentId?: string, level = 0) => {
    const children = groups.filter(g => g.parent_id === parentId);
    if (children.length === 0 && level === 0) {
      return groups.filter(g => !g.parent_id).map(group => (
        <div key={group.id} className="border-b last:border-b-0">
          <div
            className="flex items-center p-3 hover:bg-muted/50 cursor-pointer"
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => setSelectedGroup(group)}
          >
            {level > 0 && <span className="mr-2 text-muted-foreground">├─</span>}
            <span className="mr-2">{getTypeIcon(group.type)}</span>
            <span className="font-medium">{group.name}</span>
            <span className="ml-2 text-muted-foreground">({group.member_count} pessoas)</span>
            {group.leader_name && (
              <span className="ml-auto text-sm text-muted-foreground">Líder: {group.leader_name}</span>
            )}
            <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground" />
          </div>
          {renderHierarchy(group.id, level + 1)}
        </div>
      ));
    }
    
    return children.map(group => (
      <div key={group.id}>
        <div
          className="flex items-center p-3 hover:bg-muted/50 cursor-pointer"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => setSelectedGroup(group)}
        >
          {level > 0 && <span className="mr-2 text-muted-foreground">├─</span>}
          <span className="mr-2">{getTypeIcon(group.type)}</span>
          <span className="font-medium">{group.name}</span>
          <span className="ml-2 text-muted-foreground">({group.member_count} pessoas)</span>
          {group.leader_name && (
            <span className="ml-auto text-sm text-muted-foreground">Líder: {group.leader_name}</span>
          )}
          <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground" />
        </div>
        {renderHierarchy(group.id, level + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input placeholder="Buscar grupo..." className="max-w-sm" />
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'hierarchy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('hierarchy')}
          >
            Hierarquia
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Criar Grupo
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        📊 Total: {groups.length} grupos | {groups.reduce((acc, g) => acc + g.member_count, 0)} pessoas
      </p>

      <Card>
        <CardHeader>
          <CardTitle>🏢 Estrutura Organizacional</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {renderHierarchy()}
        </CardContent>
      </Card>

      {/* Transversal Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">💡 Grupos Transversais (sem hierarquia)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {groups.filter(g => g.type === 'committee').map(group => (
              <div key={group.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer" onClick={() => setSelectedGroup(group)}>
                <span>• {group.name} ({group.member_count} membros)</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Group Dialog */}
      <AddGroupDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      {/* Group Detail Dialog */}
      <GroupDetailDialog group={selectedGroup} open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)} />
    </div>
  );
};

// Add Group Dialog
const AddGroupDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { createGroup, groups } = useGroups();
  const { people } = usePeople();
  const [formData, setFormData] = useState({
    name: '',
    type: 'team' as Group['type'],
    parent_id: '',
    leader_id: '',
    description: '',
    tags: [] as string[],
    is_public: true,
    allow_self_join: false,
  });

  const handleSubmit = () => {
    const leader = people.find(p => p.id === formData.leader_id);
    createGroup({
      ...formData,
      leader_name: leader?.name,
      parent_name: groups.find(g => g.id === formData.parent_id)?.name,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Grupo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Grupo *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Grupo</Label>
            <Select
              value={formData.type}
              onValueChange={(v) => setFormData({ ...formData, type: v as Group['type'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team">Equipe</SelectItem>
                <SelectItem value="department">Departamento</SelectItem>
                <SelectItem value="project">Projeto</SelectItem>
                <SelectItem value="committee">Comitê</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Grupo Pai (hierarquia)</Label>
            <Select
              value={formData.parent_id}
              onValueChange={(v) => setFormData({ ...formData, parent_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhum (raiz)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum (raiz)</SelectItem>
                {groups.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Líder do Grupo</Label>
            <Select
              value={formData.leader_id}
              onValueChange={(v) => setFormData({ ...formData, leader_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {people.filter(p => p.status === 'confirmed').map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Grupo visível para toda empresa</Label>
              <Switch
                checked={formData.is_public}
                onCheckedChange={(c) => setFormData({ ...formData, is_public: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Permitir auto-inscrição</Label>
              <Switch
                checked={formData.allow_self_join}
                onCheckedChange={(c) => setFormData({ ...formData, allow_self_join: c })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar Grupo</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Group Detail Dialog
const GroupDetailDialog = ({ group, open, onOpenChange }: { group: Group | null; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { members } = useGroupDetail(group?.id || '');
  const { getTypeIcon, getTypeLabel } = useGroups();

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{getTypeIcon(group.type)}</span>
            {group.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Tipo:</span> {getTypeLabel(group.type)}</p>
            {group.parent_name && <p><span className="text-muted-foreground">Grupo Pai:</span> {group.parent_name}</p>}
            {group.leader_name && <p><span className="text-muted-foreground">Líder:</span> {group.leader_name}</p>}
            <p><span className="text-muted-foreground">Membros:</span> {group.member_count}</p>
            {group.description && <p><span className="text-muted-foreground">Descrição:</span> {group.description}</p>}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">👥 Membros ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {members.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span>{m.person_name}</span>
                    <Badge variant={m.role === 'owner' ? 'default' : 'secondary'}>
                      {m.role === 'owner' ? 'Líder' : 'Participante'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" /> Adicionar Membros
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" /> Editar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
export const PeopleGroupsPanel = () => {
  const [activeTab, setActiveTab] = useState('people');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pessoas & Grupos</h2>
        <p className="text-muted-foreground">Gerencie colaboradores e estrutura organizacional</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Pessoas
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Grupos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="people">
          <PeopleList />
        </TabsContent>

        <TabsContent value="groups">
          <GroupsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};
