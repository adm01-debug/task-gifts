import {
  memo,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  keyExtractor?: (item: T, index: number) => string;
  gap?: number;
  loading?: boolean;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onEndReached,
  endReachedThreshold = 200,
  keyExtractor,
  gap = 0,
  loading = false,
  loadingComponent,
  emptyComponent,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const endReachedRef = useRef(false);

  // Calculate effective item height including gap
  const effectiveItemHeight = itemHeight + gap;

  // Calculate visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const totalHeight = items.length * effectiveItemHeight;
    const start = Math.max(0, Math.floor(scrollTop / effectiveItemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / effectiveItemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);

    return {
      startIndex: start,
      endIndex: end,
      visibleItems: items.slice(start, end + 1),
      totalHeight,
    };
  }, [items, scrollTop, effectiveItemHeight, containerHeight, overscan]);

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      setScrollTop(target.scrollTop);

      // Check if end reached
      if (onEndReached) {
        const distanceToEnd =
          target.scrollHeight - target.scrollTop - target.clientHeight;
        if (distanceToEnd < endReachedThreshold && !endReachedRef.current) {
          endReachedRef.current = true;
          onEndReached();
        } else if (distanceToEnd >= endReachedThreshold) {
          endReachedRef.current = false;
        }
      }
    },
    [onEndReached, endReachedThreshold]
  );

  // Reset end reached when items change
  useEffect(() => {
    endReachedRef.current = false;
  }, [items.length]);

  // Scroll to item
  const scrollToItem = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: index * effectiveItemHeight,
          behavior,
        });
      }
    },
    [effectiveItemHeight]
  );

  // Scroll to top
  const scrollToTop = useCallback((behavior: ScrollBehavior = "smooth") => {
    scrollToItem(0, behavior);
  }, [scrollToItem]);

  const totalHeight = items.length * effectiveItemHeight;

  if (items.length === 0 && !loading) {
    return emptyComponent || null;
  }

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto relative", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map((item, localIndex) => {
          const actualIndex = startIndex + localIndex;
          const key = keyExtractor
            ? keyExtractor(item, actualIndex)
            : actualIndex.toString();

          const style: React.CSSProperties = {
            position: "absolute",
            top: actualIndex * effectiveItemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          };

          return (
            <div key={key}>
              {renderItem(item, actualIndex, style)}
            </div>
          );
        })}
      </div>

      {loading && loadingComponent}
    </div>
  );
}

// Simple virtualized grid
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerHeight: number;
  columns: number;
  renderItem: (item: T, index: number) => ReactNode;
  gap?: number;
  className?: string;
  overscan?: number;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerHeight,
  columns,
  renderItem,
  gap = 16,
  className,
  overscan = 2,
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const rowHeight = itemHeight + gap;
  const rows = Math.ceil(items.length / columns);
  const totalHeight = rows * rowHeight;

  const { startRow, endRow } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleRows = Math.ceil(containerHeight / rowHeight);
    const end = Math.min(rows - 1, start + visibleRows + overscan * 2);
    return { startRow: start, endRow: end };
  }, [scrollTop, rowHeight, containerHeight, rows, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleItems = useMemo(() => {
    const result: { item: T; index: number; row: number; col: number }[] = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (index < items.length) {
          result.push({ item: items[index], index, row, col });
        }
      }
    }
    return result;
  }, [items, startRow, endRow, columns]);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto relative", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map(({ item, index, row, col }) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: row * rowHeight,
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Animated virtual list item wrapper
interface AnimatedItemProps {
  children: ReactNode;
  index: number;
  style: React.CSSProperties;
  className?: string;
}

export const AnimatedVirtualItem = memo(function AnimatedVirtualItem({
  children,
  index,
  style,
  className,
}: AnimatedItemProps) {
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (index % 10) * 0.02 }}
      className={className}
    >
      {children}
    </motion.div>
  );
});
