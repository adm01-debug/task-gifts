/**
 * useIntersectionObserver - Hook para lazy loading e detecção de visibilidade
 */

import { useEffect, useRef, useState, useCallback } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  onChange?: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void;
}

interface UseIntersectionObserverReturn {
  ref: React.RefObject<HTMLElement>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = "0px",
  freezeOnceVisible = false,
  onChange,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn {
  const elementRef = useRef<HTMLElement>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const frozen = useRef(false);

  const isIntersecting = entry?.isIntersecting ?? false;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If frozen, don't observe anymore
    if (frozen.current) return;

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);
        onChange?.(observerEntry.isIntersecting, observerEntry);

        // Freeze if visible and option enabled
        if (freezeOnceVisible && observerEntry.isIntersecting) {
          frozen.current = true;
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, onChange]);

  return {
    ref: elementRef as React.RefObject<HTMLElement>,
    isIntersecting,
    entry,
  };
}

/**
 * useLazyLoad - Hook simplificado para lazy loading
 */
export function useLazyLoad(options?: Omit<UseIntersectionObserverOptions, 'freezeOnceVisible'>) {
  const { ref, isIntersecting } = useIntersectionObserver({
    ...options,
    freezeOnceVisible: true,
    rootMargin: options?.rootMargin ?? "100px",
  });

  return { ref, shouldLoad: isIntersecting };
}

/**
 * useInfiniteScroll - Hook para scroll infinito
 */
interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (isIntersecting: boolean) => {
      if (isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        handleIntersection(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleIntersection, threshold, rootMargin]);

  return { loadMoreRef };
}

export default useIntersectionObserver;
