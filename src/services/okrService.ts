import { supabase } from "@/integrations/supabase/client";

export interface Objective {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  department_id?: string;
  parent_objective_id?: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  progress: number;
  weight: number;
  visibility: 'public' | 'department' | 'private';
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  description?: string;
  metric_type: 'percentage' | 'number' | 'currency' | 'boolean';
  start_value: number;
  current_value: number;
  target_value: number;
  unit?: string;
  weight: number;
  owner_id: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface KeyResultUpdate {
  id: string;
  key_result_id: string;
  previous_value: number;
  new_value: number;
  comment?: string;
  updated_by: string;
  created_at: string;
}

export interface OKRCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'review' | 'closed';
  created_at: string;
}

// Mock data para desenvolvimento
const mockObjectives: Objective[] = [
  {
    id: '1',
    title: 'Aumentar Satisfação do Cliente',
    description: 'Melhorar NPS e reduzir tempo de resposta',
    owner_id: 'user-1',
    period_start: '2025-01-01',
    period_end: '2025-03-31',
    status: 'active',
    progress: 65,
    weight: 1,
    visibility: 'public',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Expandir Base de Usuários',
    description: 'Crescer 50% em novos usuários ativos',
    owner_id: 'user-1',
    period_start: '2025-01-01',
    period_end: '2025-03-31',
    status: 'active',
    progress: 40,
    weight: 1,
    visibility: 'public',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockKeyResults: KeyResult[] = [
  {
    id: 'kr-1',
    objective_id: '1',
    title: 'NPS acima de 70',
    metric_type: 'number',
    start_value: 45,
    current_value: 62,
    target_value: 70,
    weight: 1,
    owner_id: 'user-1',
    status: 'on_track',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'kr-2',
    objective_id: '1',
    title: 'Tempo de resposta < 2h',
    metric_type: 'number',
    start_value: 8,
    current_value: 3,
    target_value: 2,
    unit: 'horas',
    weight: 1,
    owner_id: 'user-1',
    status: 'at_risk',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'kr-3',
    objective_id: '2',
    title: 'Novos usuários ativos',
    metric_type: 'number',
    start_value: 1000,
    current_value: 1350,
    target_value: 1500,
    weight: 1,
    owner_id: 'user-1',
    status: 'on_track',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const okrService = {
  async getObjectives(filters?: { 
    ownerId?: string; 
    departmentId?: string; 
    status?: string;
    cycleId?: string;
  }): Promise<Objective[]> {
    // Simulação - retorna mock data
    let results = [...mockObjectives];
    
    if (filters?.status) {
      results = results.filter(o => o.status === filters.status);
    }
    
    return results;
  },

  async getObjectiveById(id: string): Promise<Objective | null> {
    return mockObjectives.find(o => o.id === id) || null;
  },

  async createObjective(objective: Omit<Objective, 'id' | 'created_at' | 'updated_at' | 'progress'>): Promise<Objective> {
    const newObjective: Objective = {
      ...objective,
      id: `obj-${Date.now()}`,
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockObjectives.push(newObjective);
    return newObjective;
  },

  async updateObjective(id: string, updates: Partial<Objective>): Promise<Objective> {
    const index = mockObjectives.findIndex(o => o.id === id);
    if (index >= 0) {
      mockObjectives[index] = { ...mockObjectives[index], ...updates, updated_at: new Date().toISOString() };
      return mockObjectives[index];
    }
    throw new Error('Objective not found');
  },

  async deleteObjective(id: string): Promise<void> {
    const index = mockObjectives.findIndex(o => o.id === id);
    if (index >= 0) {
      mockObjectives.splice(index, 1);
    }
  },

  async getKeyResults(objectiveId: string): Promise<KeyResult[]> {
    return mockKeyResults.filter(kr => kr.objective_id === objectiveId);
  },

  async createKeyResult(keyResult: Omit<KeyResult, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<KeyResult> {
    const newKR: KeyResult = {
      ...keyResult,
      id: `kr-${Date.now()}`,
      status: 'on_track',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockKeyResults.push(newKR);
    return newKR;
  },

  async updateKeyResultProgress(id: string, newValue: number, comment?: string): Promise<KeyResult> {
    const index = mockKeyResults.findIndex(kr => kr.id === id);
    if (index >= 0) {
      const kr = mockKeyResults[index];
      const progress = ((newValue - kr.start_value) / (kr.target_value - kr.start_value)) * 100;
      
      let status: KeyResult['status'] = 'on_track';
      if (progress >= 100) status = 'completed';
      else if (progress < 30) status = 'behind';
      else if (progress < 60) status = 'at_risk';
      
      mockKeyResults[index] = { 
        ...kr, 
        current_value: newValue, 
        status,
        updated_at: new Date().toISOString() 
      };
      return mockKeyResults[index];
    }
    throw new Error('Key Result not found');
  },

  async getOKRCycles(): Promise<OKRCycle[]> {
    return [
      { id: '1', name: 'Q1 2025', start_date: '2025-01-01', end_date: '2025-03-31', status: 'active', created_at: new Date().toISOString() },
      { id: '2', name: 'Q2 2025', start_date: '2025-04-01', end_date: '2025-06-30', status: 'planning', created_at: new Date().toISOString() }
    ];
  },

  async calculateObjectiveProgress(objectiveId: string): Promise<number> {
    const keyResults = await this.getKeyResults(objectiveId);
    if (keyResults.length === 0) return 0;
    
    const totalWeight = keyResults.reduce((sum, kr) => sum + kr.weight, 0);
    const weightedProgress = keyResults.reduce((sum, kr) => {
      const krProgress = ((kr.current_value - kr.start_value) / (kr.target_value - kr.start_value)) * 100;
      return sum + (Math.min(100, Math.max(0, krProgress)) * kr.weight);
    }, 0);
    
    return Math.round(weightedProgress / totalWeight);
  },

  async getTeamOKRs(departmentId: string): Promise<{ objectives: Objective[]; avgProgress: number }> {
    const objectives = mockObjectives.filter(o => o.department_id === departmentId);
    const avgProgress = objectives.length > 0 
      ? objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length 
      : 0;
    
    return { objectives, avgProgress: Math.round(avgProgress) };
  }
};
