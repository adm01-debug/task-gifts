import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ExternalApiKeyInsert = Database["public"]["Tables"]["external_api_keys"]["Insert"];
type ExternalApiKeyUpdate = Database["public"]["Tables"]["external_api_keys"]["Update"];
type WebhookSubscriptionInsert = Database["public"]["Tables"]["webhook_subscriptions"]["Insert"];
type WebhookSubscriptionUpdate = Database["public"]["Tables"]["webhook_subscriptions"]["Update"];

export interface ExternalApiKey {
  id: string;
  name: string;
  description: string | null;
  api_key: string;
  api_secret: string;
  system_type: string;
  permissions: string[];
  is_active: boolean;
  rate_limit_per_minute: number;
  last_used_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookSubscription {
  id: string;
  api_key_id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  headers: Record<string, string>;
  last_triggered_at: string | null;
  last_status: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApiRequestLog {
  id: string;
  api_key_id: string | null;
  endpoint: string;
  method: string;
  request_body: any;
  response_status: number;
  response_body: any;
  ip_address: string | null;
  user_agent: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface WebhookDeliveryLog {
  id: string;
  subscription_id: string;
  event_type: string;
  payload: any;
  response_status: number | null;
  response_body: string | null;
  attempt_count: number;
  success: boolean;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface ExternalTask {
  id: string;
  api_key_id: string | null;
  external_id: string;
  external_system: string;
  user_email: string;
  user_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  priority: string;
  status: string;
  xp_reward: number;
  coin_reward: number;
  xp_penalty_late: number;
  xp_penalty_rework: number;
  deadline_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Generate random API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'tg_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate random API secret
function generateApiSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'tgs_';
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const externalApiService = {
  // ===== API KEYS =====
  async getApiKeys(): Promise<ExternalApiKey[]> {
    const { data, error } = await supabase
      .from('external_api_keys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as ExternalApiKey[];
  },

  async createApiKey(
    name: string,
    description: string | null,
    systemType: string,
    permissions: string[],
    rateLimitPerMinute: number,
    createdBy: string
  ): Promise<ExternalApiKey> {
    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();

    const insertData: ExternalApiKeyInsert = {
      name,
      description,
      api_key: apiKey,
      api_secret: apiSecret,
      system_type: systemType,
      permissions,
      rate_limit_per_minute: rateLimitPerMinute,
      created_by: createdBy
    };

    const { data, error } = await supabase
      .from('external_api_keys')
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw error;
    return data as ExternalApiKey;
  },

  async updateApiKey(
    id: string,
    updates: Partial<Pick<ExternalApiKey, 'name' | 'description' | 'system_type' | 'permissions' | 'is_active' | 'rate_limit_per_minute'>>
  ): Promise<void> {
    const updateData: ExternalApiKeyUpdate = updates;
    const { error } = await supabase
      .from('external_api_keys')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteApiKey(id: string): Promise<void> {
    const { error } = await supabase
      .from('external_api_keys')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async regenerateApiSecret(id: string): Promise<string> {
    const newSecret = generateApiSecret();
    
    const updateData: ExternalApiKeyUpdate = { api_secret: newSecret };
    const { error } = await supabase
      .from('external_api_keys')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    return newSecret;
  },

  // ===== WEBHOOKS =====
  async getWebhookSubscriptions(apiKeyId?: string): Promise<WebhookSubscription[]> {
    let query = supabase
      .from('webhook_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (apiKeyId) {
      query = query.eq('api_key_id', apiKeyId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as WebhookSubscription[];
  },

  async createWebhookSubscription(
    apiKeyId: string,
    name: string,
    url: string,
    events: string[],
    headers?: Record<string, string>
  ): Promise<WebhookSubscription> {
    const secret = generateApiSecret();

    const insertData: WebhookSubscriptionInsert = {
      api_key_id: apiKeyId,
      name,
      url,
      secret,
      events,
      headers: headers || {}
    };

    const { data, error } = await supabase
      .from('webhook_subscriptions')
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw error;
    return data as WebhookSubscription;
  },

  async updateWebhookSubscription(
    id: string,
    updates: Partial<Pick<WebhookSubscription, 'name' | 'url' | 'events' | 'is_active' | 'retry_count' | 'timeout_seconds' | 'headers'>>
  ): Promise<void> {
    const updateData: WebhookSubscriptionUpdate = updates;
    const { error } = await supabase
      .from('webhook_subscriptions')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteWebhookSubscription(id: string): Promise<void> {
    const { error } = await supabase
      .from('webhook_subscriptions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // ===== LOGS =====
  async getApiRequestLogs(apiKeyId?: string, limit: number = 100): Promise<ApiRequestLog[]> {
    let query = supabase
      .from('api_request_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (apiKeyId) {
      query = query.eq('api_key_id', apiKeyId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as ApiRequestLog[];
  },

  async getWebhookDeliveryLogs(subscriptionId?: string, limit: number = 100): Promise<WebhookDeliveryLog[]> {
    let query = supabase
      .from('webhook_delivery_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (subscriptionId) {
      query = query.eq('subscription_id', subscriptionId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as WebhookDeliveryLog[];
  },

  // ===== EXTERNAL TASKS =====
  async getExternalTasks(filters?: {
    system?: string;
    status?: string;
    userEmail?: string;
  }, limit: number = 100): Promise<ExternalTask[]> {
    let query = supabase
      .from('external_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (filters?.system) {
      query = query.eq('external_system', filters.system);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.userEmail) {
      query = query.eq('user_email', filters.userEmail);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as ExternalTask[];
  },

  async getExternalTaskStats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    late: number;
    rejected: number;
    bySystem: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('external_tasks')
      .select('status, external_system');
    
    if (error) throw error;
    
    const tasks = data || [];
    const bySystem: Record<string, number> = {};
    
    tasks.forEach(t => {
      bySystem[t.external_system] = (bySystem[t.external_system] || 0) + 1;
    });

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completed: tasks.filter(t => t.status === 'on_time').length,
      late: tasks.filter(t => t.status === 'late').length,
      rejected: tasks.filter(t => t.status === 'rejected' || t.status === 'rework').length,
      bySystem
    };
  },

  // ===== AVAILABLE EVENTS =====
  getAvailableEvents(): { value: string; label: string; description: string }[] {
    return [
      { value: 'task.created', label: 'Tarefa Criada', description: 'Quando uma tarefa é registrada no sistema' },
      { value: 'task.completed', label: 'Tarefa Concluída', description: 'Quando uma tarefa é completada no prazo' },
      { value: 'task.late', label: 'Tarefa Atrasada', description: 'Quando uma tarefa é completada com atraso' },
      { value: 'task.rejected', label: 'Tarefa Rejeitada', description: 'Quando uma tarefa é rejeitada' },
      { value: 'user.level_up', label: 'Subiu de Nível', description: 'Quando um usuário sobe de nível' },
      { value: 'user.achievement_unlocked', label: 'Conquista Desbloqueada', description: 'Quando um usuário desbloqueia uma conquista' },
      { value: 'leaderboard.update', label: 'Ranking Atualizado', description: 'Quando o ranking é recalculado' },
      { value: 'penalty.applied', label: 'Penalidade Aplicada', description: 'Quando uma penalidade é aplicada a um usuário' }
    ];
  },

  // ===== SYSTEM TYPES =====
  getSystemTypes(): { value: string; label: string }[] {
    return [
      { value: 'generic', label: 'Sistema Genérico' },
      { value: 'financeiro', label: 'Sistema Financeiro' },
      { value: 'fabricacao', label: 'Sistema de Fabricação' },
      { value: 'rh', label: 'Sistema de RH' },
      { value: 'vendas', label: 'Sistema de Vendas' },
      { value: 'suporte', label: 'Sistema de Suporte' },
      { value: 'logistica', label: 'Sistema de Logística' },
      { value: 'marketing', label: 'Sistema de Marketing' },
      { value: 'bitrix24', label: 'Bitrix24' },
      { value: 'erp', label: 'ERP' },
      { value: 'crm', label: 'CRM' }
    ];
  },

  // ===== PERMISSIONS =====
  getAvailablePermissions(): { value: string; label: string; description: string }[] {
    return [
      { value: 'read', label: 'Leitura', description: 'Pode consultar dados (usuários, tarefas, ranking)' },
      { value: 'write', label: 'Escrita', description: 'Pode criar e atualizar tarefas, adicionar XP/moedas' },
      { value: 'admin', label: 'Admin', description: 'Pode gerenciar webhooks e configurações' }
    ];
  }
};
