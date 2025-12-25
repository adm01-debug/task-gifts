import { supabase } from "@/integrations/supabase/client";

export interface Person {
  id: string;
  name: string;
  email: string;
  personal_email?: string;
  phone?: string;
  cpf?: string;
  employee_id?: string;
  birth_date?: string;
  hire_date: string;
  position: string;
  department_id: string;
  department_name?: string;
  manager_id?: string;
  manager_name?: string;
  contract_type: 'clt' | 'pj' | 'intern' | 'temp';
  status: 'invited' | 'confirmed' | 'inactive' | 'deleted';
  last_access?: string;
  avatar_url?: string;
  groups: string[];
  permission_group: string;
  demographics: Record<string, string>;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  type: 'team' | 'department' | 'project' | 'committee' | 'other';
  parent_id?: string;
  parent_name?: string;
  leader_id?: string;
  leader_name?: string;
  description?: string;
  member_count: number;
  tags: string[];
  is_public: boolean;
  allow_self_join: boolean;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  person_id: string;
  person_name: string;
  role: 'owner' | 'participant';
  joined_at: string;
}

// Mock data
const mockPeople: Person[] = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria@empresa.com',
    personal_email: 'maria.s@gmail.com',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    employee_id: 'EMP-001234',
    birth_date: '1992-03-15',
    hire_date: '2020-03-15',
    position: 'Desenvolvedora Senior',
    department_id: '1',
    department_name: 'Tecnologia',
    manager_id: '2',
    manager_name: 'João Santos',
    contract_type: 'clt',
    status: 'confirmed',
    last_access: new Date().toISOString(),
    groups: ['1', '2', '3'],
    permission_group: 'Colaborador Padrão',
    demographics: {
      gender: 'Feminino',
      location: 'São Paulo - SP',
      education: 'Superior Completo',
    },
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao@empresa.com',
    hire_date: '2018-06-01',
    position: 'Tech Lead',
    department_id: '1',
    department_name: 'Tecnologia',
    contract_type: 'clt',
    status: 'confirmed',
    last_access: new Date().toISOString(),
    groups: ['1'],
    permission_group: 'Gestor',
    demographics: { gender: 'Masculino', location: 'São Paulo - SP' },
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana@empresa.com',
    hire_date: '2024-10-01',
    position: 'Analista de RH',
    department_id: '2',
    department_name: 'RH',
    contract_type: 'clt',
    status: 'invited',
    groups: ['4'],
    permission_group: 'Colaborador Padrão',
    demographics: { gender: 'Feminino', location: 'Rio de Janeiro - RJ' },
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Pedro Lima',
    email: 'pedro@empresa.com',
    hire_date: '2021-01-15',
    position: 'Desenvolvedor Pleno',
    department_id: '1',
    department_name: 'Tecnologia',
    contract_type: 'clt',
    status: 'confirmed',
    last_access: new Date().toISOString(),
    groups: ['1', '2'],
    permission_group: 'Colaborador Padrão',
    demographics: { gender: 'Masculino', location: 'São Paulo - SP' },
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Carlos Dias',
    email: 'carlos@empresa.com',
    hire_date: '2019-05-10',
    position: 'Vendedor',
    department_id: '3',
    department_name: 'Vendas',
    contract_type: 'clt',
    status: 'inactive',
    groups: ['5'],
    permission_group: 'Colaborador Padrão',
    demographics: { gender: 'Masculino', location: 'Belo Horizonte - MG' },
    created_at: new Date().toISOString(),
  },
];

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Tecnologia',
    type: 'department',
    leader_id: '2',
    leader_name: 'João Santos',
    description: 'Departamento de Tecnologia',
    member_count: 45,
    tags: ['tech', 'engineering'],
    is_public: true,
    allow_self_join: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Squad Backend',
    type: 'team',
    parent_id: '1',
    parent_name: 'Tecnologia',
    leader_id: '1',
    leader_name: 'Maria Silva',
    description: 'Squad responsável pelas APIs backend',
    member_count: 12,
    tags: ['backend', 'api'],
    is_public: true,
    allow_self_join: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Comitê de Inovação',
    type: 'committee',
    leader_id: '2',
    leader_name: 'João Santos',
    description: 'Comitê transversal de inovação',
    member_count: 12,
    tags: ['inovação', 'transversal'],
    is_public: true,
    allow_self_join: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'RH',
    type: 'department',
    leader_id: '3',
    leader_name: 'Ana Costa',
    description: 'Recursos Humanos',
    member_count: 8,
    tags: ['rh', 'people'],
    is_public: true,
    allow_self_join: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Vendas',
    type: 'department',
    description: 'Departamento de Vendas',
    member_count: 28,
    tags: ['sales', 'comercial'],
    is_public: true,
    allow_self_join: false,
    created_at: new Date().toISOString(),
  },
];

export const peopleService = {
  async getAll(): Promise<Person[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPeople;
  },

  async getById(id: string): Promise<Person | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPeople.find(p => p.id === id) || null;
  },

  async getByDepartment(departmentId: string): Promise<Person[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPeople.filter(p => p.department_id === departmentId);
  },

  async getByStatus(status: Person['status']): Promise<Person[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPeople.filter(p => p.status === status);
  },

  async create(person: Omit<Person, 'id' | 'created_at'>): Promise<Person> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newPerson: Person = {
      ...person,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    mockPeople.push(newPerson);
    return newPerson;
  },

  async update(id: string, updates: Partial<Person>): Promise<Person> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockPeople.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Person not found');
    mockPeople[index] = { ...mockPeople[index], ...updates };
    return mockPeople[index];
  },

  async updateStatus(id: string, status: Person['status']): Promise<Person> {
    return this.update(id, { status });
  },

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockPeople.findIndex(p => p.id === id);
    if (index !== -1) mockPeople[index].status = 'deleted';
  },

  async getStats(): Promise<{
    total: number;
    active: number;
    invited: number;
    inactive: number;
    deleted: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      total: mockPeople.length,
      active: mockPeople.filter(p => p.status === 'confirmed').length,
      invited: mockPeople.filter(p => p.status === 'invited').length,
      inactive: mockPeople.filter(p => p.status === 'inactive').length,
      deleted: mockPeople.filter(p => p.status === 'deleted').length,
    };
  },

  getStatusIcon(status: Person['status']): string {
    switch (status) {
      case 'invited': return '📧';
      case 'confirmed': return '✅';
      case 'inactive': return '⏸️';
      case 'deleted': return '🗑️';
      default: return '❓';
    }
  },

  getStatusLabel(status: Person['status']): string {
    switch (status) {
      case 'invited': return 'Convidado';
      case 'confirmed': return 'Confirmado';
      case 'inactive': return 'Inativo';
      case 'deleted': return 'Excluído';
      default: return 'Desconhecido';
    }
  },
};

export const groupService = {
  async getAll(): Promise<Group[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockGroups;
  },

  async getById(id: string): Promise<Group | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockGroups.find(g => g.id === id) || null;
  },

  async getHierarchy(): Promise<Group[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return groups organized by hierarchy
    return mockGroups.sort((a, b) => {
      if (!a.parent_id && b.parent_id) return -1;
      if (a.parent_id && !b.parent_id) return 1;
      return a.name.localeCompare(b.name);
    });
  },

  async create(group: Omit<Group, 'id' | 'created_at' | 'member_count'>): Promise<Group> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newGroup: Group = {
      ...group,
      id: Date.now().toString(),
      member_count: 0,
      created_at: new Date().toISOString(),
    };
    mockGroups.push(newGroup);
    return newGroup;
  },

  async update(id: string, updates: Partial<Group>): Promise<Group> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockGroups.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Group not found');
    mockGroups[index] = { ...mockGroups[index], ...updates };
    return mockGroups[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockGroups.findIndex(g => g.id === id);
    if (index !== -1) mockGroups.splice(index, 1);
  },

  async getMembers(groupId: string): Promise<GroupMember[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPeople
      .filter(p => p.groups.includes(groupId))
      .map(p => ({
        id: `${groupId}-${p.id}`,
        group_id: groupId,
        person_id: p.id,
        person_name: p.name,
        role: p.id === mockGroups.find(g => g.id === groupId)?.leader_id ? 'owner' : 'participant',
        joined_at: p.created_at,
      }));
  },

  async addMember(groupId: string, personId: string, role: 'owner' | 'participant'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const person = mockPeople.find(p => p.id === personId);
    if (person && !person.groups.includes(groupId)) {
      person.groups.push(groupId);
    }
  },

  async removeMember(groupId: string, personId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const person = mockPeople.find(p => p.id === personId);
    if (person) {
      person.groups = person.groups.filter(g => g !== groupId);
    }
  },

  getTypeIcon(type: Group['type']): string {
    switch (type) {
      case 'team': return '👥';
      case 'department': return '🏢';
      case 'project': return '📁';
      case 'committee': return '🎯';
      default: return '📋';
    }
  },

  getTypeLabel(type: Group['type']): string {
    switch (type) {
      case 'team': return 'Equipe';
      case 'department': return 'Departamento';
      case 'project': return 'Projeto';
      case 'committee': return 'Comitê';
      default: return 'Outro';
    }
  },
};
