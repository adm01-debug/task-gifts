import { supabase } from "@/integrations/supabase/client";

export interface KPI {
  id: string;
  name: string;
  category: string;
  owner_id: string;
  owner_name?: string;
  unit: 'percentage' | 'currency' | 'number' | 'hours' | 'score';
  data_source: 'manual' | 'api' | 'sheets' | 'sql';
  formula?: string;
  api_endpoint?: string;
  api_field?: string;
  current_value: number;
  previous_value?: number;
  target_value: number;
  critical_threshold: number;
  warning_threshold: number;
  good_threshold: number;
  excellent_threshold: number;
  update_frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  last_updated: string;
  trend: 'up' | 'down' | 'stable';
  trend_percentage?: number;
  status: 'critical' | 'warning' | 'good' | 'excellent';
  is_visible_dashboard: boolean;
  is_visible_reports: boolean;
  created_at: string;
}

export interface KPIUpdate {
  id: string;
  kpi_id: string;
  value: number;
  updated_by: string;
  updated_at: string;
  notes?: string;
}

export interface KPIAlert {
  id: string;
  kpi_id: string;
  condition: 'below' | 'above';
  threshold: number;
  recipients: string[];
  channels: ('email' | 'slack' | 'in_app')[];
  is_active: boolean;
}

// Mock data for KPIs
const mockKPIs: KPI[] = [
  {
    id: '1',
    name: 'Taxa de Conversão de Vendas',
    category: 'Vendas',
    owner_id: '1',
    owner_name: 'Diretor Comercial',
    unit: 'percentage',
    data_source: 'api',
    current_value: 17.5,
    previous_value: 15.2,
    target_value: 18,
    critical_threshold: 10,
    warning_threshold: 15,
    good_threshold: 18,
    excellent_threshold: 20,
    update_frequency: 'daily',
    last_updated: new Date().toISOString(),
    trend: 'up',
    trend_percentage: 2.3,
    status: 'good',
    is_visible_dashboard: true,
    is_visible_reports: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ticket Médio',
    category: 'Vendas',
    owner_id: '1',
    owner_name: 'Diretor Comercial',
    unit: 'currency',
    data_source: 'manual',
    current_value: 8450,
    previous_value: 8000,
    target_value: 8000,
    critical_threshold: 5000,
    warning_threshold: 6000,
    good_threshold: 7500,
    excellent_threshold: 8000,
    update_frequency: 'weekly',
    last_updated: new Date().toISOString(),
    trend: 'up',
    trend_percentage: 5.6,
    status: 'excellent',
    is_visible_dashboard: true,
    is_visible_reports: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'CAC (Custo Aquisição Cliente)',
    category: 'Vendas',
    owner_id: '1',
    owner_name: 'Diretor Comercial',
    unit: 'currency',
    data_source: 'manual',
    current_value: 245,
    previous_value: 233,
    target_value: 200,
    critical_threshold: 350,
    warning_threshold: 250,
    good_threshold: 200,
    excellent_threshold: 150,
    update_frequency: 'monthly',
    last_updated: new Date().toISOString(),
    trend: 'up',
    trend_percentage: 5.2,
    status: 'warning',
    is_visible_dashboard: true,
    is_visible_reports: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'NPS (Net Promoter Score)',
    category: 'Customer Success',
    owner_id: '2',
    owner_name: 'Head de CS',
    unit: 'score',
    data_source: 'api',
    current_value: 58,
    previous_value: 55,
    target_value: 70,
    critical_threshold: 30,
    warning_threshold: 50,
    good_threshold: 65,
    excellent_threshold: 80,
    update_frequency: 'weekly',
    last_updated: new Date().toISOString(),
    trend: 'up',
    trend_percentage: 3,
    status: 'warning',
    is_visible_dashboard: true,
    is_visible_reports: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Churn Rate',
    category: 'Customer Success',
    owner_id: '2',
    owner_name: 'Head de CS',
    unit: 'percentage',
    data_source: 'api',
    current_value: 3.2,
    previous_value: 4.0,
    target_value: 5,
    critical_threshold: 10,
    warning_threshold: 7,
    good_threshold: 5,
    excellent_threshold: 3,
    update_frequency: 'monthly',
    last_updated: new Date().toISOString(),
    trend: 'down',
    trend_percentage: -0.8,
    status: 'excellent',
    is_visible_dashboard: true,
    is_visible_reports: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'SLA de Atendimento',
    category: 'Operações',
    owner_id: '3',
    owner_name: 'Gerente de Operações',
    unit: 'percentage',
    data_source: 'api',
    current_value: 95,
    previous_value: 93,
    target_value: 90,
    critical_threshold: 70,
    warning_threshold: 80,
    good_threshold: 90,
    excellent_threshold: 95,
    update_frequency: 'daily',
    last_updated: new Date().toISOString(),
    trend: 'up',
    trend_percentage: 2,
    status: 'excellent',
    is_visible_dashboard: true,
    is_visible_reports: true,
    created_at: new Date().toISOString(),
  },
];

const mockKPIHistory: Record<string, { month: string; value: number }[]> = {
  '1': [
    { month: 'Jul', value: 12.5 },
    { month: 'Ago', value: 13.2 },
    { month: 'Set', value: 14.8 },
    { month: 'Out', value: 18.5 },
    { month: 'Nov', value: 15.2 },
    { month: 'Dez', value: 17.5 },
  ],
};

export const kpiService = {
  async getAll(): Promise<KPI[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockKPIs;
  },

  async getById(id: string): Promise<KPI | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockKPIs.find(k => k.id === id) || null;
  },

  async getByCategory(category: string): Promise<KPI[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockKPIs.filter(k => k.category === category);
  },

  async getHistory(kpiId: string): Promise<{ month: string; value: number }[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockKPIHistory[kpiId] || [];
  },

  async create(kpi: Omit<KPI, 'id' | 'created_at' | 'status' | 'trend'>): Promise<KPI> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newKPI: KPI = {
      ...kpi,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      status: 'good',
      trend: 'stable',
    };
    mockKPIs.push(newKPI);
    return newKPI;
  },

  async update(id: string, updates: Partial<KPI>): Promise<KPI> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockKPIs.findIndex(k => k.id === id);
    if (index === -1) throw new Error('KPI not found');
    mockKPIs[index] = { ...mockKPIs[index], ...updates };
    return mockKPIs[index];
  },

  async updateValue(id: string, value: number, notes?: string): Promise<KPI> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockKPIs.findIndex(k => k.id === id);
    if (index === -1) throw new Error('KPI not found');
    
    const kpi = mockKPIs[index];
    const previousValue = kpi.current_value;
    const trendPercentage = previousValue > 0 
      ? ((value - previousValue) / previousValue) * 100 
      : 0;
    
    let status: KPI['status'] = 'good';
    if (value < kpi.critical_threshold) status = 'critical';
    else if (value < kpi.warning_threshold) status = 'warning';
    else if (value >= kpi.excellent_threshold) status = 'excellent';
    
    mockKPIs[index] = {
      ...kpi,
      previous_value: previousValue,
      current_value: value,
      trend: trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'stable',
      trend_percentage: Math.abs(trendPercentage),
      status,
      last_updated: new Date().toISOString(),
    };
    
    return mockKPIs[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockKPIs.findIndex(k => k.id === id);
    if (index !== -1) mockKPIs.splice(index, 1);
  },

  async getCategories(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const categories = [...new Set(mockKPIs.map(k => k.category))];
    return categories;
  },

  formatValue(value: number, unit: KPI['unit']): string {
    switch (unit) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `R$ ${value.toLocaleString('pt-BR')}`;
      case 'hours':
        return `${value}h`;
      case 'score':
        return `${value}`;
      default:
        return value.toLocaleString('pt-BR');
    }
  },

  getStatusColor(status: KPI['status']): string {
    switch (status) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'good': return 'text-green-500';
      case 'excellent': return 'text-emerald-500';
      default: return 'text-muted-foreground';
    }
  },

  getStatusIcon(status: KPI['status']): string {
    switch (status) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      case 'good': return '🟢';
      case 'excellent': return '⭐';
      default: return '⚪';
    }
  },
};
