import { supabase } from "@/integrations/supabase/client";

export interface Bitrix24Status {
  configured: boolean;
  connected: boolean;
  expired: boolean;
  domain: string | null;
  memberId: string | null;
}

export interface Bitrix24Lead {
  ID: string;
  TITLE: string;
  NAME?: string;
  LAST_NAME?: string;
  STATUS_ID?: string;
  OPPORTUNITY?: string;
  CURRENCY_ID?: string;
  ASSIGNED_BY_ID?: string;
  DATE_CREATE?: string;
  DATE_MODIFY?: string;
  COMMENTS?: string;
  SOURCE_ID?: string;
  PHONE?: Array<{ VALUE: string; VALUE_TYPE: string }>;
  EMAIL?: Array<{ VALUE: string; VALUE_TYPE: string }>;
}

export interface Bitrix24Deal {
  ID: string;
  TITLE: string;
  STAGE_ID?: string;
  OPPORTUNITY?: string;
  CURRENCY_ID?: string;
  ASSIGNED_BY_ID?: string;
  DATE_CREATE?: string;
  DATE_MODIFY?: string;
  CLOSEDATE?: string;
  CONTACT_ID?: string;
  COMPANY_ID?: string;
}

export interface Bitrix24Contact {
  ID: string;
  NAME: string;
  LAST_NAME?: string;
  PHONE?: Array<{ VALUE: string; VALUE_TYPE: string }>;
  EMAIL?: Array<{ VALUE: string; VALUE_TYPE: string }>;
  ASSIGNED_BY_ID?: string;
  DATE_CREATE?: string;
  COMPANY_ID?: string;
}

export interface Bitrix24Task {
  ID: string;
  TITLE: string;
  DESCRIPTION?: string;
  STATUS?: number;
  PRIORITY?: number;
  RESPONSIBLE_ID?: string;
  CREATED_BY?: string;
  DEADLINE?: string;
  DATE_START?: string;
  CLOSED_DATE?: string;
}

export interface Bitrix24User {
  ID: string;
  NAME: string;
  LAST_NAME?: string;
  EMAIL?: string;
  WORK_POSITION?: string;
  UF_DEPARTMENT?: number[];
  ACTIVE?: boolean;
}

// Check connection status
export const getConnectionStatus = async (): Promise<Bitrix24Status> => {
  const { data, error } = await supabase.functions.invoke('bitrix24-oauth', {
    body: {},
    method: 'GET',
  });

  // Use query params approach
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bitrix24-oauth?action=status`,
    {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao verificar status');
  }

  return response.json();
};

// Get OAuth URL
export const getAuthUrl = async (): Promise<string> => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bitrix24-oauth?action=authorize`,
    {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Falha ao obter URL de autorização');
  }

  const data = await response.json();
  return data.authUrl;
};

// Generic API call
const callApi = async <T>(module: string, action: string, data?: any): Promise<T> => {
  const { data: result, error } = await supabase.functions.invoke('bitrix24-api', {
    body: { module, action, data },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
};

// CRM - Leads
export const getLeads = (filter?: any) => callApi<Bitrix24Lead[]>('crm', 'getLeads', filter);
export const getLead = (id: string) => callApi<Bitrix24Lead>('crm', 'getLead', { id });
export const createLead = (fields: Partial<Bitrix24Lead>) => callApi<string>('crm', 'createLead', fields);
export const updateLead = (id: string, fields: Partial<Bitrix24Lead>) => 
  callApi<boolean>('crm', 'updateLead', { id, fields });
export const deleteLead = (id: string) => callApi<boolean>('crm', 'deleteLead', { id });

// CRM - Deals
export const getDeals = (filter?: any) => callApi<Bitrix24Deal[]>('crm', 'getDeals', filter);
export const getDeal = (id: string) => callApi<Bitrix24Deal>('crm', 'getDeal', { id });
export const createDeal = (fields: Partial<Bitrix24Deal>) => callApi<string>('crm', 'createDeal', fields);
export const updateDeal = (id: string, fields: Partial<Bitrix24Deal>) => 
  callApi<boolean>('crm', 'updateDeal', { id, fields });
export const deleteDeal = (id: string) => callApi<boolean>('crm', 'deleteDeal', { id });

// CRM - Contacts
export const getContacts = (filter?: any) => callApi<Bitrix24Contact[]>('crm', 'getContacts', filter);
export const getContact = (id: string) => callApi<Bitrix24Contact>('crm', 'getContact', { id });
export const createContact = (fields: Partial<Bitrix24Contact>) => callApi<string>('crm', 'createContact', fields);
export const updateContact = (id: string, fields: Partial<Bitrix24Contact>) => 
  callApi<boolean>('crm', 'updateContact', { id, fields });
export const deleteContact = (id: string) => callApi<boolean>('crm', 'deleteContact', { id });

// Tasks
export const getTasks = (filter?: any) => callApi<Bitrix24Task[]>('tasks', 'getTasks', filter);
export const getTask = (id: string) => callApi<Bitrix24Task>('tasks', 'getTask', { id });
export const createTask = (fields: Partial<Bitrix24Task>) => callApi<string>('tasks', 'createTask', fields);
export const updateTask = (id: string, fields: Partial<Bitrix24Task>) => 
  callApi<boolean>('tasks', 'updateTask', { id, fields });
export const deleteTask = (id: string) => callApi<boolean>('tasks', 'deleteTask', { id });
export const completeTask = (id: string) => callApi<boolean>('tasks', 'completeTask', { id });

// Calendar
export const getCalendarEvents = (filter?: any) => callApi<any[]>('calendar', 'getEvents', filter);
export const createCalendarEvent = (fields: any) => callApi<string>('calendar', 'createEvent', fields);
export const updateCalendarEvent = (fields: any) => callApi<boolean>('calendar', 'updateEvent', fields);
export const deleteCalendarEvent = (id: string) => callApi<boolean>('calendar', 'deleteEvent', { id });

// Users
export const getBitrixUsers = (filter?: any) => callApi<Bitrix24User[]>('users', 'getUsers', filter);
export const getBitrixUser = (id: string) => callApi<Bitrix24User>('users', 'getUser', { id });
export const getCurrentBitrixUser = () => callApi<Bitrix24User>('users', 'getCurrentUser', {});
export const getBitrixDepartments = () => callApi<any[]>('users', 'getDepartments', {});

// Raw API call for custom methods
export const callRawMethod = <T>(method: string, params?: any) => 
  callApi<T>('raw', method, params);

// Sync mappings
export const getSyncMappings = async (entityType?: string) => {
  let query = supabase
    .from('bitrix24_sync_mappings')
    .select('*')
    .order('last_synced_at', { ascending: false });

  if (entityType) {
    query = query.eq('entity_type', entityType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Webhook logs
export const getWebhookLogs = async (limit = 50) => {
  const { data, error } = await supabase
    .from('bitrix24_webhook_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};
