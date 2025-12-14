import { useState, useEffect, useRef, ReactNode, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyWidgetProps {
  children: ReactNode;
  fallbackHeight?: string;
  rootMargin?: string;
  threshold?: number;
}

/**
 * LazyWidget - Renders children only when visible in viewport
 * Uses Intersection Observer to defer rendering of "below the fold" widgets
 * Improves initial page load performance on mobile devices
 */
export const LazyWidget = memo(function LazyWidget({ 
  children, 
  fallbackHeight = "200px",
  rootMargin = "100px",
  threshold = 0.1
}: LazyWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      setHasBeenVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasBeenVisible(true);
            // Once visible, stop observing
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  // Once rendered, keep it rendered (no unmounting on scroll out)
  if (hasBeenVisible) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} style={{ minHeight: fallbackHeight }}>
      {isVisible ? (
        children
      ) : (
        <div className="space-y-3 p-4 rounded-xl border border-border bg-card animate-pulse">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
});
