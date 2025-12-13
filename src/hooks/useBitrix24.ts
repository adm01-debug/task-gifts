import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as bitrix24Service from "@/services/bitrix24Service";
import { toast } from "sonner";

// Connection status
export const useBitrix24Status = () => {
  return useQuery({
    queryKey: ['bitrix24-status'],
    queryFn: bitrix24Service.getConnectionStatus,
    refetchInterval: 60000, // Check every minute
    retry: 1,
  });
};

// CRM Leads
export const useBitrix24Leads = (filter?: any) => {
  return useQuery({
    queryKey: ['bitrix24-leads', filter],
    queryFn: () => bitrix24Service.getLeads(filter),
    enabled: false, // Only fetch when explicitly called
  });
};

export const useCreateBitrix24Lead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bitrix24Service.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitrix24-leads'] });
      toast.success('Lead criado no Bitrix24');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar lead: ${error.message}`);
    },
  });
};

export const useUpdateBitrix24Lead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: Partial<bitrix24Service.Bitrix24Lead> }) =>
      bitrix24Service.updateLead(id, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitrix24-leads'] });
      toast.success('Lead atualizado no Bitrix24');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar lead: ${error.message}`);
    },
  });
};

// CRM Deals
export const useBitrix24Deals = (filter?: any) => {
  return useQuery({
    queryKey: ['bitrix24-deals', filter],
    queryFn: () => bitrix24Service.getDeals(filter),
    enabled: false,
  });
};

export const useCreateBitrix24Deal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bitrix24Service.createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitrix24-deals'] });
      toast.success('Negócio criado no Bitrix24');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar negócio: ${error.message}`);
    },
  });
};

// CRM Contacts
export const useBitrix24Contacts = (filter?: any) => {
  return useQuery({
    queryKey: ['bitrix24-contacts', filter],
    queryFn: () => bitrix24Service.getContacts(filter),
    enabled: false,
  });
};

export const useCreateBitrix24Contact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bitrix24Service.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitrix24-contacts'] });
      toast.success('Contato criado no Bitrix24');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar contato: ${error.message}`);
    },
  });
};

// Tasks
export const useBitrix24Tasks = (filter?: any) => {
  return useQuery({
    queryKey: ['bitrix24-tasks', filter],
    queryFn: () => bitrix24Service.getTasks(filter),
    enabled: false,
  });
};

export const useCreateBitrix24Task = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bitrix24Service.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitrix24-tasks'] });
      toast.success('Tarefa criada no Bitrix24');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    },
  });
};

export const useCompleteBitrix24Task = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bitrix24Service.completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitrix24-tasks'] });
      toast.success('Tarefa concluída no Bitrix24');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao concluir tarefa: ${error.message}`);
    },
  });
};

// Calendar
export const useBitrix24Calendar = (filter?: any) => {
  return useQuery({
    queryKey: ['bitrix24-calendar', filter],
    queryFn: () => bitrix24Service.getCalendarEvents(filter),
    enabled: false,
  });
};

export const useCreateBitrix24Event = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bitrix24Service.createCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitrix24-calendar'] });
      toast.success('Evento criado no Bitrix24');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar evento: ${error.message}`);
    },
  });
};

// Users
export const useBitrix24Users = () => {
  return useQuery({
    queryKey: ['bitrix24-users'],
    queryFn: () => bitrix24Service.getBitrixUsers(),
    enabled: false,
  });
};

export const useBitrix24Departments = () => {
  return useQuery({
    queryKey: ['bitrix24-departments'],
    queryFn: bitrix24Service.getBitrixDepartments,
    enabled: false,
  });
};

// Sync mappings
export const useBitrix24SyncMappings = (entityType?: string) => {
  return useQuery({
    queryKey: ['bitrix24-sync-mappings', entityType],
    queryFn: () => bitrix24Service.getSyncMappings(entityType),
  });
};

// Webhook logs
export const useBitrix24WebhookLogs = (limit = 50) => {
  return useQuery({
    queryKey: ['bitrix24-webhook-logs', limit],
    queryFn: () => bitrix24Service.getWebhookLogs(limit),
    refetchInterval: 30000,
  });
};

// Connect to Bitrix24
export const useConnectBitrix24 = () => {
  return useMutation({
    mutationFn: async () => {
      const authUrl = await bitrix24Service.getAuthUrl();
      window.location.href = authUrl;
    },
    onError: (error: Error) => {
      toast.error(`Erro ao conectar: ${error.message}`);
    },
  });
};
