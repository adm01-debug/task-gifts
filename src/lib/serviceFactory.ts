/**
 * Service Factory - Padrão centralizado para criação de serviços
 * Garante consistência, tratamento de erros e logging em todos os serviços
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggingService";

export interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

export interface PaginatedResponse<T> extends ServiceResponse<T[]> {
  count: number | null;
  hasMore: boolean;
}

export interface ServiceOptions {
  enableLogging?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

const DEFAULT_OPTIONS: ServiceOptions = {
  enableLogging: true,
  retryAttempts: 3,
  retryDelay: 1000,
};

/**
 * Wrapper para operações de serviço com retry automático
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: ServiceOptions = DEFAULT_OPTIONS
): Promise<T> {
  const { retryAttempts = 3, retryDelay = 1000, enableLogging = true } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (enableLogging) {
        logger.warn(`Attempt ${attempt}/${retryAttempts} failed: ${lastError.message}`, 'ServiceFactory');
      }
      
      if (attempt < retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }
  
  throw lastError;
}

/**
 * Cria uma resposta de serviço padronizada
 */
export function createResponse<T>(data: T | null, error: Error | null = null): ServiceResponse<T> {
  return {
    data,
    error,
    success: error === null && data !== null,
  };
}

/**
 * Cria uma resposta paginada padronizada
 */
export function createPaginatedResponse<T>(
  data: T[] | null,
  count: number | null,
  pageSize: number,
  error: Error | null = null
): PaginatedResponse<T> {
  return {
    data,
    error,
    success: error === null && data !== null,
    count,
    hasMore: count !== null && data !== null ? data.length >= pageSize : false,
  };
}

/**
 * Helper para obter o usuário atual
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("User not authenticated");
  return user;
}

/**
 * Helper para verificar autenticação
 */
export async function requireAuth(): Promise<string> {
  const user = await getCurrentUser();
  return user.id;
}

/**
 * Wrapper para operações que requerem autenticação
 */
export async function withAuth<T>(
  operation: (userId: string) => Promise<T>
): Promise<ServiceResponse<T>> {
  try {
    const userId = await requireAuth();
    const data = await operation(userId);
    return createResponse(data);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Auth operation failed: ${err.message}`, 'ServiceFactory', err);
    return createResponse<T>(null, err);
  }
}

/**
 * Wrapper para operações de banco de dados
 */
export async function withDatabase<T>(
  operation: () => Promise<{ data: T | null; error: Error | null }>
): Promise<ServiceResponse<T>> {
  try {
    const { data, error } = await operation();
    if (error) throw error;
    return createResponse(data);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Database operation failed: ${err.message}`, 'ServiceFactory', err);
    return createResponse<T>(null, err);
  }
}

/**
 * Cache simples em memória para operações frequentes
 */
const cache = new Map<string, { data: unknown; timestamp: number }>();

export function getCached<T>(key: string, ttlMs: number = 60000): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(keyPattern?: string): void {
  if (keyPattern) {
    for (const key of cache.keys()) {
      if (key.includes(keyPattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}
