/**
 * VirtualizedList - Lista virtualizada para grandes quantidades de dados
 * Renderiza apenas os itens visíveis na viewport para máxima performance
 */

import { memo, useRef, useEffect, useState, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  containerHeight?: number | string;
  overscan?: number;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
  isLoading?: boolean;
  keyExtractor?: (item: T, index: number) => string;
}

interface VirtualizedState {
  startIndex: number;
  endIndex: number;
  offsetY: number;
}

function VirtualizedListInner<T>({
  items,
  itemHeight,
  renderItem,
  className,
  containerHeight = 400,
  overscan = 3,
  onEndReached,
  endReachedThreshold = 200,
  emptyState,
  loadingState,
  isLoading = false,
  keyExtractor,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<VirtualizedState>({
    startIndex: 0,
    endIndex: 10,
    offsetY: 0,
  });

  const totalHeight = items.length * itemHeight;

  const calculateVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
    );

    setState({
      startIndex,
      endIndex,
      offsetY: startIndex * itemHeight,
    });

    // Check if we're near the end
    if (onEndReached) {
      const distanceFromEnd = totalHeight - scrollTop - viewportHeight;
      if (distanceFromEnd < endReachedThreshold) {
        onEndReached();
      }
    }
  }, [items.length, itemHeight, overscan, onEndReached, totalHeight, endReachedThreshold]);

  useEffect(() => {
    calculateVisibleRange();
  }, [calculateVisibleRange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      requestAnimationFrame(calculateVisibleRange);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [calculateVisibleRange]);

  // Handle resize
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      calculateVisibleRange();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [calculateVisibleRange]);

  if (items.length === 0 && !isLoading) {
    return emptyState ? <>{emptyState}</> : null;
  }

  const visibleItems = items.slice(state.startIndex, state.endIndex);

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-auto relative",
        "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
        className
      )}
      style={{ height: containerHeight }}
    >
      {/* Spacer to maintain scroll height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Positioned container for visible items */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${state.offsetY}px)`,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = state.startIndex + index;
            const key = keyExtractor 
              ? keyExtractor(item, actualIndex) 
              : actualIndex.toString();
            
            return (
              <div
                key={key}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading indicator at bottom */}
      {isLoading && loadingState && (
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm py-4">
          {loadingState}
        </div>
      )}
    </div>
  );
}

export const VirtualizedList = memo(VirtualizedListInner) as typeof VirtualizedListInner;

// Hook for programmatic control
export function useVirtualizedList<T>(items: T[], itemHeight: number) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) return;

    const targetOffset = index * itemHeight;
    container.scrollTo({ top: targetOffset, behavior });
  }, [itemHeight]);

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, []);

  return {
    containerRef,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    itemCount: items.length,
  };
}

export default VirtualizedList;
