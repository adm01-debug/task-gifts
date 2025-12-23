import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { externalApiService, ExternalApiKey, WebhookSubscription } from "@/services/externalApiService";
import { toast } from "sonner";

// ===== API KEYS =====
export function useApiKeys() {
  return useQuery({
    queryKey: ['external-api-keys'],
    queryFn: () => externalApiService.getApiKeys()
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      name: string;
      description: string | null;
      systemType: string;
      permissions: string[];
      rateLimitPerMinute: number;
      createdBy: string;
    }) => externalApiService.createApiKey(
      params.name,
      params.description,
      params.systemType,
      params.permissions,
      params.rateLimitPerMinute,
      params.createdBy
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-api-keys'] });
      toast.success('API Key criada com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar API Key: ' + error.message);
    }
  });
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      id: string;
      updates: Partial<Pick<ExternalApiKey, 'name' | 'description' | 'system_type' | 'permissions' | 'is_active' | 'rate_limit_per_minute'>>;
    }) => externalApiService.updateApiKey(params.id, params.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-api-keys'] });
      toast.success('API Key atualizada');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => externalApiService.deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-api-keys'] });
      toast.success('API Key excluída');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir: ' + error.message);
    }
  });
}

export function useRegenerateApiSecret() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => externalApiService.regenerateApiSecret(id),
    onSuccess: (newSecret) => {
      queryClient.invalidateQueries({ queryKey: ['external-api-keys'] });
      toast.success('Secret regenerado. Novo secret: ' + newSecret.substring(0, 20) + '...');
    },
    onError: (error: any) => {
      toast.error('Erro ao regenerar: ' + error.message);
    }
  });
}

// ===== WEBHOOKS =====
export function useWebhookSubscriptions(apiKeyId?: string) {
  return useQuery({
    queryKey: ['webhook-subscriptions', apiKeyId],
    queryFn: () => externalApiService.getWebhookSubscriptions(apiKeyId)
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      apiKeyId: string;
      name: string;
      url: string;
      events: string[];
      headers?: Record<string, string>;
    }) => externalApiService.createWebhookSubscription(
      params.apiKeyId,
      params.name,
      params.url,
      params.events,
      params.headers
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] });
      toast.success('Webhook criado com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar webhook: ' + error.message);
    }
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      id: string;
      updates: Partial<Pick<WebhookSubscription, 'name' | 'url' | 'events' | 'is_active' | 'retry_count' | 'timeout_seconds' | 'headers'>>;
    }) => externalApiService.updateWebhookSubscription(params.id, params.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] });
      toast.success('Webhook atualizado');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => externalApiService.deleteWebhookSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] });
      toast.success('Webhook excluído');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir: ' + error.message);
    }
  });
}

// ===== LOGS =====
export function useApiRequestLogs(apiKeyId?: string, limit: number = 100) {
  return useQuery({
    queryKey: ['api-request-logs', apiKeyId, limit],
    queryFn: () => externalApiService.getApiRequestLogs(apiKeyId, limit)
  });
}

export function useWebhookDeliveryLogs(subscriptionId?: string, limit: number = 100) {
  return useQuery({
    queryKey: ['webhook-delivery-logs', subscriptionId, limit],
    queryFn: () => externalApiService.getWebhookDeliveryLogs(subscriptionId, limit)
  });
}

// ===== EXTERNAL TASKS =====
export function useExternalTasks(filters?: {
  system?: string;
  status?: string;
  userEmail?: string;
}, limit: number = 100) {
  return useQuery({
    queryKey: ['external-tasks', filters, limit],
    queryFn: () => externalApiService.getExternalTasks(filters, limit)
  });
}

export function useExternalTaskStats() {
  return useQuery({
    queryKey: ['external-task-stats'],
    queryFn: () => externalApiService.getExternalTaskStats()
  });
}

// ===== HELPERS =====
export function useAvailableEvents() {
  return externalApiService.getAvailableEvents();
}

export function useSystemTypes() {
  return externalApiService.getSystemTypes();
}

export function useAvailablePermissions() {
  return externalApiService.getAvailablePermissions();
}
