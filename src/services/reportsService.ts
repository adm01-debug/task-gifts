import { supabase } from "@/integrations/supabase/client";

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'engagement' | 'performance' | 'talent' | 'custom';
  config: ReportConfig;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

export interface ReportConfig {
  metrics: string[];
  dimensions: string[];
  filters?: Record<string, unknown>;
  visualization: 'table' | 'chart' | 'mixed';
  chartType?: 'bar' | 'line' | 'pie' | 'radar';
}

export interface GeneratedReport {
  id: string;
  template_id: string;
  name: string;
  data: Record<string, unknown>[];
  generated_at: string;
  generated_by: string;
  filters_applied?: Record<string, unknown>;
}

export interface AnalyticsMetric {
  key: string;
  label: string;
  value: number;
  previous_value?: number;
  change_percent?: number;
  trend: 'up' | 'down' | 'stable';
}

export interface EngagementSummary {
  enps: number;
  lnps: number;
  climateScore: number;
  participationRate: number;
  trends: {
    enps: number;
    lnps: number;
    climate: number;
    participation: number;
  };
  pillarScores: { pillar: string; score: number; trend: number }[];
}

export interface TalentSummary {
  totalEvaluations: number;
  avgScore: number;
  pendingPDIs: number;
  completedTrainings: number;
  topPerformers: { name: string; score: number }[];
  skillGaps: { skill: string; gap: number }[];
}

const mockTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Relatório de Engajamento Mensal',
    description: 'Visão geral de engajamento com eNPS, clima e participação',
    category: 'engagement',
    config: {
      metrics: ['enps', 'climate_score', 'participation_rate'],
      dimensions: ['department', 'month'],
      visualization: 'mixed',
      chartType: 'line'
    },
    is_public: true,
    created_by: 'system',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Performance por Departamento',
    description: 'Comparativo de performance entre departamentos',
    category: 'performance',
    config: {
      metrics: ['okr_progress', 'goal_completion', 'avg_evaluation'],
      dimensions: ['department'],
      visualization: 'chart',
      chartType: 'bar'
    },
    is_public: true,
    created_by: 'system',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Mapa de Talentos',
    description: 'Análise de competências e gaps do time',
    category: 'talent',
    config: {
      metrics: ['skill_coverage', 'training_completion', 'pdi_progress'],
      dimensions: ['skill', 'department'],
      visualization: 'mixed',
      chartType: 'radar'
    },
    is_public: true,
    created_by: 'system',
    created_at: new Date().toISOString()
  }
];

export const reportsService = {
  async getTemplates(category?: string): Promise<ReportTemplate[]> {
    let templates = [...mockTemplates];
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    return templates;
  },

  async getTemplateById(id: string): Promise<ReportTemplate | null> {
    return mockTemplates.find(t => t.id === id) || null;
  },

  async createTemplate(template: Omit<ReportTemplate, 'id' | 'created_at'>): Promise<ReportTemplate> {
    const newTemplate: ReportTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    mockTemplates.push(newTemplate);
    return newTemplate;
  },

  async generateReport(templateId: string, filters?: Record<string, unknown>): Promise<GeneratedReport> {
    const template = await this.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    // Simulação de geração de relatório
    return {
      id: `report-${Date.now()}`,
      template_id: templateId,
      name: template.name,
      data: [
        { department: 'Tecnologia', enps: 45, climate: 78, participation: 92 },
        { department: 'Vendas', enps: 38, climate: 72, participation: 85 },
        { department: 'RH', enps: 52, climate: 81, participation: 100 },
        { department: 'Marketing', enps: 41, climate: 75, participation: 88 },
      ],
      generated_at: new Date().toISOString(),
      generated_by: 'current-user',
      filters_applied: filters
    };
  },

  async getEngagementSummary(departmentId?: string): Promise<EngagementSummary> {
    return {
      enps: 42,
      lnps: 38,
      climateScore: 76,
      participationRate: 87,
      trends: {
        enps: 5,
        lnps: -2,
        climate: 3,
        participation: 2
      },
      pillarScores: [
        { pillar: 'Reconhecimento', score: 68, trend: -2 },
        { pillar: 'Autonomia', score: 72, trend: 3 },
        { pillar: 'Crescimento', score: 61, trend: -5 },
        { pillar: 'Liderança', score: 75, trend: 4 },
        { pillar: 'Pares', score: 82, trend: 2 },
        { pillar: 'Propósito', score: 78, trend: 1 },
        { pillar: 'Ambiente', score: 70, trend: -1 },
        { pillar: 'Comunicação', score: 65, trend: -3 },
        { pillar: 'Benefícios', score: 58, trend: 0 },
        { pillar: 'Equilíbrio', score: 73, trend: 2 },
      ]
    };
  },

  async getTalentSummary(departmentId?: string): Promise<TalentSummary> {
    return {
      totalEvaluations: 145,
      avgScore: 8.2,
      pendingPDIs: 23,
      completedTrainings: 89,
      topPerformers: [
        { name: 'Maria Silva', score: 9.4 },
        { name: 'João Santos', score: 9.2 },
        { name: 'Ana Costa', score: 9.0 },
      ],
      skillGaps: [
        { skill: 'Liderança', gap: 15 },
        { skill: 'Comunicação', gap: 12 },
        { skill: 'Inovação', gap: 8 },
      ]
    };
  },

  async getAnalyticsMetrics(period: string): Promise<AnalyticsMetric[]> {
    return [
      { key: 'active_users', label: 'Usuários Ativos', value: 142, previous_value: 135, change_percent: 5.2, trend: 'up' },
      { key: 'survey_responses', label: 'Respostas Pesquisas', value: 523, previous_value: 489, change_percent: 6.9, trend: 'up' },
      { key: 'feedbacks_given', label: 'Feedbacks Enviados', value: 87, previous_value: 92, change_percent: -5.4, trend: 'down' },
      { key: 'goals_completed', label: 'Metas Concluídas', value: 34, previous_value: 28, change_percent: 21.4, trend: 'up' },
      { key: 'trainings_done', label: 'Treinamentos', value: 156, previous_value: 142, change_percent: 9.8, trend: 'up' },
      { key: 'recognitions', label: 'Reconhecimentos', value: 203, previous_value: 187, change_percent: 8.5, trend: 'up' },
    ];
  },

  async exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<string> {
    // Simulação - retorna URL do arquivo
    return `https://api.example.com/reports/${reportId}/download.${format}`;
  }
};
