/**
 * usePrefetch - Hook para pré-carregamento de dados
 * Melhora UX antecipando necessidades do usuário
 */

import { useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

interface PrefetchOptions {
  staleTime?: number;
  delay?: number;
}

const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export function usePrefetch() {
  const queryClient = useQueryClient();
  const prefetchedKeys = useRef<Set<string>>(new Set());
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      for (const timeout of timeoutRefs.current.values()) {
        clearTimeout(timeout);
      }
    };
  }, []);

  /**
   * Prefetch genérico com delay opcional
   */
  const prefetch = useCallback(async <T,>(
    queryKey: readonly unknown[],
    queryFn: () => Promise<T>,
    options: PrefetchOptions = {}
  ) => {
    const { staleTime = DEFAULT_STALE_TIME, delay = 0 } = options;
    const keyString = JSON.stringify(queryKey);

    // Evita prefetch duplicado
    if (prefetchedKeys.current.has(keyString)) {
      return;
    }

    const executePrefetch = async () => {
      prefetchedKeys.current.add(keyString);
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime,
      });
    };

    if (delay > 0) {
      const timeout = setTimeout(executePrefetch, delay);
      timeoutRefs.current.set(keyString, timeout);
    } else {
      await executePrefetch();
    }
  }, [queryClient]);

  /**
   * Prefetch ao hover (com delay para evitar spam)
   */
  const prefetchOnHover = useCallback(<T,>(
    queryKey: readonly unknown[],
    queryFn: () => Promise<T>,
    options: PrefetchOptions = {}
  ) => {
    return {
      onMouseEnter: () => prefetch(queryKey, queryFn, { ...options, delay: options.delay ?? 200 }),
      onFocus: () => prefetch(queryKey, queryFn, { ...options, delay: options.delay ?? 200 }),
    };
  }, [prefetch]);

  /**
   * Prefetch de perfil de usuário
   */
  const prefetchProfile = useCallback((userId: string) => {
    // Simulado - conectar com seu service real
    return prefetch(
      queryKeys.profiles.detail(userId),
      async () => {
        // Retorna null como placeholder - implementar fetch real
        return null;
      },
      { delay: 150 }
    );
  }, [prefetch]);

  /**
   * Prefetch de dados do dashboard
   */
  const prefetchDashboard = useCallback(() => {
    // Prefetch múltiplos recursos em paralelo
    Promise.all([
      prefetch(queryKeys.achievements.list(), async () => null),
      prefetch(queryKeys.notifications.unread(), async () => null),
      prefetch(queryKeys.announcements.pinned(), async () => null),
    ]);
  }, [prefetch]);

  /**
   * Limpa registro de prefetch (permite re-prefetch)
   */
  const clearPrefetchHistory = useCallback((keyPattern?: string) => {
    if (keyPattern) {
      for (const key of prefetchedKeys.current) {
        if (key.includes(keyPattern)) {
          prefetchedKeys.current.delete(key);
        }
      }
    } else {
      prefetchedKeys.current.clear();
    }
  }, []);

  return {
    prefetch,
    prefetchOnHover,
    prefetchProfile,
    prefetchDashboard,
    clearPrefetchHistory,
  };
}

/**
 * Hook para prefetch baseado em visibilidade
 */
export function usePrefetchOnVisible<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options: PrefetchOptions = {}
) {
  const { prefetch } = usePrefetch();
  const hasTriggered = useRef(false);

  const triggerPrefetch = useCallback(() => {
    if (!hasTriggered.current) {
      hasTriggered.current = true;
      prefetch(queryKey, queryFn, options);
    }
  }, [prefetch, queryKey, queryFn, options]);

  return { triggerPrefetch };
}

/**
 * Hook para prefetch de rotas adjacentes
 */
export function useRoutePrefetch() {
  const { prefetchDashboard, clearPrefetchHistory } = usePrefetch();

  // Prefetch com base na rota atual
  const prefetchAdjacentRoutes = useCallback((currentPath: string) => {
    switch (currentPath) {
      case '/':
        prefetchDashboard();
        break;
      // Adicionar mais rotas conforme necessário
    }
  }, [prefetchDashboard]);

  return {
    prefetchAdjacentRoutes,
    clearPrefetchHistory,
  };
}

export default usePrefetch;
