import { useEffect, useRef, useCallback, useState } from "react";

interface UseInfiniteScrollOptions {
  /** Distance from bottom to trigger load (default: 200) */
  threshold?: number;
  /** Whether more items can be loaded */
  hasMore: boolean;
  /** Whether currently loading */
  isLoading: boolean;
  /** Callback to load more items */
  onLoadMore: () => void | Promise<void>;
  /** Root element for intersection observer (default: viewport) */
  root?: Element | null;
  /** Disable the infinite scroll */
  disabled?: boolean;
}

/**
 * useInfiniteScroll - Hook for implementing infinite scroll
 * 
 * Usage:
 * const { sentinelRef, isNearBottom } = useInfiniteScroll({
 *   hasMore: data.hasNextPage,
 *   isLoading: data.isFetchingNextPage,
 *   onLoadMore: () => data.fetchNextPage(),
 * });
 * 
 * // Place sentinel at the end of your list
 * <div ref={sentinelRef} />
 */
export function useInfiniteScroll({
  threshold = 200,
  hasMore,
  isLoading,
  onLoadMore,
  root = null,
  disabled = false,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      setIsNearBottom(entry.isIntersecting);

      if (entry.isIntersecting && hasMore && !isLoading && !disabled) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore, disabled]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || disabled) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin: `${threshold}px`,
      threshold: 0,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, root, threshold, disabled]);

  return {
    sentinelRef,
    isNearBottom,
  };
}

/**
 * useScrollPagination - Simpler hook for scroll-based pagination
 * 
 * Usage:
 * const { containerRef } = useScrollPagination({
 *   onReachBottom: fetchNextPage,
 *   enabled: hasNextPage && !isFetching,
 * });
 */
export function useScrollPagination({
  onReachBottom,
  threshold = 200,
  enabled = true,
}: {
  onReachBottom: () => void;
  threshold?: number;
  enabled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < threshold) {
        onReachBottom();
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [onReachBottom, threshold, enabled]);

  return { containerRef };
}
