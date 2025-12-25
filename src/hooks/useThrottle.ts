/**
 * useThrottle - Limita a frequência de execução de uma função
 */

import { useCallback, useRef, useEffect } from "react";

/**
 * Throttle hook - executa no máximo uma vez por intervalo
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRan.current;

    if (timeSinceLastRun >= delay) {
      lastRan.current = now;
      return callbackRef.current(...args);
    }

    // Schedule trailing call
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      lastRan.current = Date.now();
      callbackRef.current(...args);
    }, delay - timeSinceLastRun);
  }, [delay]) as T;
}

/**
 * Throttled value - atualiza no máximo uma vez por intervalo
 */
export function useThrottledValue<T>(value: T, delay: number): T {
  const lastValue = useRef<T>(value);
  const lastUpdate = useRef<number>(Date.now());

  const now = Date.now();
  if (now - lastUpdate.current >= delay) {
    lastValue.current = value;
    lastUpdate.current = now;
  }

  return lastValue.current;
}

export default useThrottle;
