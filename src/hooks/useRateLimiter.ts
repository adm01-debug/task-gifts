/**
 * useRateLimiter - Hook para rate limiting em componentes
 */

import { useCallback, useState, useRef, useEffect } from "react";
import { rateLimiter, rateLimitConfigs } from "@/lib/rateLimiter";
import type { RateLimitConfig } from "@/lib/rateLimiter";

interface UseRateLimiterOptions {
  key: string;
  config?: RateLimitConfig;
  onBlocked?: () => void;
}

interface UseRateLimiterReturn {
  execute: <T>(action: () => T) => T | null;
  executeAsync: <T>(action: () => Promise<T>) => Promise<T | null>;
  canExecute: boolean;
  isBlocked: boolean;
  timeUntilReset: number;
  reset: () => void;
}

export function useRateLimiter({
  key,
  config = rateLimitConfigs.api,
  onBlocked,
}: UseRateLimiterOptions): UseRateLimiterReturn {
  const [canExecute, setCanExecute] = useState(true);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateState = useCallback(() => {
    const can = rateLimiter.canExecute(key, config);
    const time = rateLimiter.getTimeUntilReset(key, config);
    
    setCanExecute(can);
    setTimeUntilReset(time);

    return { can, time };
  }, [key, config]);

  // Update state periodically when blocked
  useEffect(() => {
    const { time } = updateState();

    if (time > 0) {
      intervalRef.current = setInterval(() => {
        const { time: newTime } = updateState();
        if (newTime <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateState]);

  const execute = useCallback(<T,>(action: () => T): T | null => {
    const result = rateLimiter.execute(key, config, action);
    
    if (result === null) {
      onBlocked?.();
    }
    
    updateState();
    return result;
  }, [key, config, onBlocked, updateState]);

  const executeAsync = useCallback(async <T,>(action: () => Promise<T>): Promise<T | null> => {
    const result = await rateLimiter.executeAsync(key, config, action);
    
    if (result === null) {
      onBlocked?.();
    }
    
    updateState();
    return result;
  }, [key, config, onBlocked, updateState]);

  const reset = useCallback(() => {
    rateLimiter.reset(key);
    updateState();
  }, [key, updateState]);

  return {
    execute,
    executeAsync,
    canExecute,
    isBlocked: !canExecute,
    timeUntilReset,
    reset,
  };
}

// Preset hooks
export function useApiRateLimiter(key: string, onBlocked?: () => void) {
  return useRateLimiter({ key: `api:${key}`, config: rateLimitConfigs.api, onBlocked });
}

export function useFormRateLimiter(formName: string, onBlocked?: () => void) {
  return useRateLimiter({ key: `form:${formName}`, config: rateLimitConfigs.formSubmit, onBlocked });
}

export function useSearchRateLimiter(onBlocked?: () => void) {
  return useRateLimiter({ key: 'search', config: rateLimitConfigs.search, onBlocked });
}

export function useButtonRateLimiter(buttonId: string, onBlocked?: () => void) {
  return useRateLimiter({ key: `btn:${buttonId}`, config: rateLimitConfigs.buttonClick, onBlocked });
}

export default useRateLimiter;
