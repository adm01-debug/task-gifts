/**
 * useErrorHandler - Hook para tratamento de erros em componentes
 */

import { useCallback } from "react";
import { errorTracker, ErrorSeverity } from "@/services/errorTrackingService";
import { toast } from "@/hooks/use-toast";

interface UseErrorHandlerOptions {
  context?: string;
  showToast?: boolean;
  severity?: ErrorSeverity;
}

interface UseErrorHandlerReturn {
  handleError: (error: unknown, customMessage?: string) => void;
  handleAsyncError: <T>(promise: Promise<T>, customMessage?: string) => Promise<T | null>;
  wrapAsync: <T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    customMessage?: string
  ) => (...args: Parameters<T>) => Promise<ReturnType<T> | null>;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const { context = 'Component', showToast = true, severity } = options;

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Track error
    errorTracker.captureError(errorObj, { component: context }, severity);

    // Show toast
    if (showToast) {
      toast({
        title: "Erro",
        description: customMessage || errorObj.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  }, [context, showToast, severity]);

  const handleAsyncError = useCallback(async <T,>(
    promise: Promise<T>,
    customMessage?: string
  ): Promise<T | null> => {
    try {
      return await promise;
    } catch (error) {
      handleError(error, customMessage);
      return null;
    }
  }, [handleError]);

  const wrapAsync = useCallback(<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    customMessage?: string
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
      try {
        return await fn(...args) as ReturnType<T>;
      } catch (error) {
        handleError(error, customMessage);
        return null;
      }
    };
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    wrapAsync,
  };
}

export default useErrorHandler;
