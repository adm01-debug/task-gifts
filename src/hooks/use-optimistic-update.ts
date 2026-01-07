import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, previousData: T) => void;
  onSettled?: () => void;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

interface OptimisticState<T> {
  data: T;
  isUpdating: boolean;
  error: Error | null;
  previousData: T | null;
}

export function useOptimisticUpdate<T>(
  initialData: T,
  options: OptimisticUpdateOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    onSettled,
    successMessage = "Atualizado com sucesso!",
    errorMessage = "Erro ao atualizar. Revertendo...",
    showToast = true,
  } = options;

  const { toast } = useToast();
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isUpdating: false,
    error: null,
    previousData: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const optimisticUpdate = useCallback(
    async (
      optimisticData: T,
      asyncOperation: () => Promise<T>
    ): Promise<void> => {
      // Store previous data for rollback
      const previousData = state.data;

      // Apply optimistic update immediately
      setState((prev) => ({
        ...prev,
        data: optimisticData,
        isUpdating: true,
        error: null,
        previousData,
      }));

      try {
        // Execute the actual async operation
        const result = await asyncOperation();

        // Update with actual result
        setState((prev) => ({
          ...prev,
          data: result,
          isUpdating: false,
          previousData: null,
        }));

        if (showToast) {
          toast({
            title: "✓ Sucesso",
            description: successMessage,
          });
        }

        onSuccess?.(result);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        // Rollback to previous data
        setState((prev) => ({
          ...prev,
          data: previousData,
          isUpdating: false,
          error: err,
          previousData: null,
        }));

        if (showToast) {
          toast({
            title: "✗ Erro",
            description: errorMessage,
            variant: "destructive",
          });
        }

        onError?.(err, previousData);
      } finally {
        onSettled?.();
      }
    },
    [state.data, successMessage, errorMessage, showToast, toast, onSuccess, onError, onSettled]
  );

  // Debounced optimistic update for frequent updates
  const debouncedUpdate = useCallback(
    (optimisticData: T, asyncOperation: () => Promise<T>, delay = 500) => {
      // Apply optimistic update immediately
      setState((prev) => ({
        ...prev,
        data: optimisticData,
        previousData: prev.previousData || prev.data,
      }));

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for async operation
      timeoutRef.current = setTimeout(() => {
        optimisticUpdate(optimisticData, asyncOperation);
      }, delay);
    },
    [optimisticUpdate]
  );

  const setData = useCallback((newData: T | ((prev: T) => T)) => {
    setState((prev) => ({
      ...prev,
      data: typeof newData === "function" ? (newData as (prev: T) => T)(prev.data) : newData,
    }));
  }, []);

  const reset = useCallback(() => {
    if (state.previousData !== null) {
      setState((prev) => ({
        ...prev,
        data: prev.previousData!,
        previousData: null,
        error: null,
      }));
    }
  }, [state.previousData]);

  return {
    data: state.data,
    isUpdating: state.isUpdating,
    error: state.error,
    optimisticUpdate,
    debouncedUpdate,
    setData,
    reset,
  };
}

// Example usage hook for likes
export function useOptimisticLike(initialLiked: boolean, initialCount: number) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleLike = useCallback(
    async (onToggle: (newLiked: boolean) => Promise<void>) => {
      const previousLiked = liked;
      const previousCount = count;

      // Optimistic update
      setLiked(!liked);
      setCount(liked ? count - 1 : count + 1);
      setIsUpdating(true);

      try {
        await onToggle(!previousLiked);
      } catch {
        // Rollback on error
        setLiked(previousLiked);
        setCount(previousCount);
      } finally {
        setIsUpdating(false);
      }
    },
    [liked, count]
  );

  return { liked, count, isUpdating, toggleLike };
}

// Hook for optimistic list operations
export function useOptimisticList<T extends { id: string }>(initialItems: T[]) {
  const [items, setItems] = useState(initialItems);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const addItem = useCallback(
    async (item: T, asyncAdd: () => Promise<T>) => {
      // Add optimistically
      setItems((prev) => [...prev, { ...item, _pending: true } as T]);
      setPendingIds((prev) => new Set(prev).add(item.id));

      try {
        const result = await asyncAdd();
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? result : i))
        );
      } catch {
        // Remove on error
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    },
    []
  );

  const removeItem = useCallback(
    async (id: string, asyncRemove: () => Promise<void>) => {
      const itemToRemove = items.find((i) => i.id === id);
      if (!itemToRemove) return;

      // Remove optimistically
      setItems((prev) => prev.filter((i) => i.id !== id));
      setPendingIds((prev) => new Set(prev).add(id));

      try {
        await asyncRemove();
      } catch {
        // Restore on error
        setItems((prev) => [...prev, itemToRemove]);
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [items]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<T>, asyncUpdate: () => Promise<T>) => {
      const originalItem = items.find((i) => i.id === id);
      if (!originalItem) return;

      // Update optimistically
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
      );
      setPendingIds((prev) => new Set(prev).add(id));

      try {
        const result = await asyncUpdate();
        setItems((prev) =>
          prev.map((i) => (i.id === id ? result : i))
        );
      } catch {
        // Restore on error
        setItems((prev) =>
          prev.map((i) => (i.id === id ? originalItem : i))
        );
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [items]
  );

  return {
    items,
    pendingIds,
    isPending: (id: string) => pendingIds.has(id),
    addItem,
    removeItem,
    updateItem,
    setItems,
  };
}
