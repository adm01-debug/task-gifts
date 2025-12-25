/**
 * Query Client Configuration - Configuração otimizada do React Query
 */

import { QueryClient } from "@tanstack/react-query";

// Configurações padrão otimizadas
const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5 minutos
const DEFAULT_GC_TIME = 1000 * 60 * 30; // 30 minutos

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dados são considerados "frescos" por 5 minutos
      staleTime: DEFAULT_STALE_TIME,
      // Mantém dados em cache por 30 minutos após não serem usados
      gcTime: DEFAULT_GC_TIME,
      // Retry com backoff exponencial
      retry: (failureCount, error) => {
        // Não fazer retry em erros de autenticação
        if (error instanceof Error && error.message.includes('auth')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch automaticamente quando a janela recebe foco
      refetchOnWindowFocus: true,
      // Não refetch em reconexão para economizar bandwidth
      refetchOnReconnect: 'always',
      // Não refetch ao montar se dados ainda são frescos
      refetchOnMount: true,
      // Network mode: sempre tentar, mesmo offline (usará cache)
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations apenas 1 vez
      retry: 1,
      // Network mode para mutations
      networkMode: 'online',
    },
  },
});

/**
 * Prefetch helper - Pré-carrega dados para navegação mais rápida
 */
export async function prefetchQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  staleTime?: number
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: staleTime ?? DEFAULT_STALE_TIME,
  });
}

/**
 * Invalidate helper - Invalida cache de forma tipada
 */
export function invalidateQueries(queryKey: readonly unknown[]): Promise<void> {
  return queryClient.invalidateQueries({ queryKey });
}

/**
 * Set query data helper - Atualiza cache otimisticamente
 */
export function setQueryData<T>(
  queryKey: readonly unknown[],
  updater: T | ((old: T | undefined) => T)
): void {
  queryClient.setQueryData(queryKey, updater);
}

/**
 * Get query data helper - Obtém dados do cache
 */
export function getQueryData<T>(queryKey: readonly unknown[]): T | undefined {
  return queryClient.getQueryData(queryKey);
}

/**
 * Cancel queries helper - Cancela queries em andamento
 */
export function cancelQueries(queryKey: readonly unknown[]): Promise<void> {
  return queryClient.cancelQueries({ queryKey });
}

/**
 * Remove queries helper - Remove queries do cache
 */
export function removeQueries(queryKey: readonly unknown[]): void {
  queryClient.removeQueries({ queryKey });
}

export default queryClient;
