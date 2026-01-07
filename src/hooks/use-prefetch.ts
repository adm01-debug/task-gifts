import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface PrefetchConfig {
  delay?: number; // Delay before prefetching on hover (ms)
  threshold?: number; // Intersection observer threshold
  rootMargin?: string; // Root margin for intersection observer
}

// Cache for prefetched modules
const prefetchedModules = new Set<string>();
const prefetchPromises = new Map<string, Promise<unknown>>();

// Route to module mapping - adjust based on your actual routes
const routeModuleMap: Record<string, () => Promise<unknown>> = {
  "/": () => import("@/pages/Index"),
  "/login": () => import("@/pages/Login"),
  "/dashboard": () => import("@/pages/Dashboard"),
  "/profile": () => import("@/pages/Profile"),
  "/leaderboard": () => import("@/pages/Leaderboard"),
  "/quests": () => import("@/pages/Quests"),
  "/achievements": () => import("@/pages/Achievements"),
  "/store": () => import("@/pages/Store"),
  "/quiz": () => import("@/pages/Quiz"),
  "/training": () => import("@/pages/Training"),
  "/settings": () => import("@/pages/Settings"),
  "/admin": () => import("@/pages/Admin"),
};

// Prefetch a single route
export function prefetchRoute(route: string): Promise<unknown> | undefined {
  // Already prefetched
  if (prefetchedModules.has(route)) {
    return undefined;
  }

  // Already prefetching
  if (prefetchPromises.has(route)) {
    return prefetchPromises.get(route);
  }

  const loader = routeModuleMap[route];
  if (!loader) {
    return undefined;
  }

  const promise = loader()
    .then((module) => {
      prefetchedModules.add(route);
      prefetchPromises.delete(route);
      return module;
    })
    .catch((error) => {
      prefetchPromises.delete(route);
      console.warn(`Failed to prefetch route: ${route}`, error);
    });

  prefetchPromises.set(route, promise);
  return promise;
}

// Prefetch multiple routes
export function prefetchRoutes(routes: string[]): void {
  routes.forEach(prefetchRoute);
}

// Hook for prefetching on link hover
export function usePrefetchLink(to: string, config: PrefetchConfig = {}) {
  const { delay = 100 } = config;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      prefetchRoute(to);
    }, delay);
  }, [to, delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleFocus = useCallback(() => {
    prefetchRoute(to);
  }, [to]);

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
  };
}

// Hook for prefetching visible links
export function usePrefetchOnVisible(
  ref: React.RefObject<HTMLElement>,
  routes: string[],
  config: PrefetchConfig = {}
) {
  const { threshold = 0.1, rootMargin = "50px" } = config;

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            prefetchRoutes(routes);
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, routes, threshold, rootMargin]);
}

// Hook for prefetching adjacent routes
export function usePrefetchAdjacent() {
  const location = useLocation();

  useEffect(() => {
    // Define adjacent routes for each page
    const adjacentRoutes: Record<string, string[]> = {
      "/": ["/dashboard", "/login"],
      "/dashboard": ["/profile", "/quests", "/leaderboard"],
      "/profile": ["/dashboard", "/achievements", "/settings"],
      "/quests": ["/dashboard", "/achievements"],
      "/leaderboard": ["/dashboard", "/profile"],
      "/achievements": ["/profile", "/quests"],
      "/store": ["/dashboard", "/profile"],
      "/training": ["/dashboard", "/quests"],
    };

    const routesToPrefetch = adjacentRoutes[location.pathname];
    if (routesToPrefetch) {
      // Delay prefetching to avoid competing with current page load
      const timeout = setTimeout(() => {
        prefetchRoutes(routesToPrefetch);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [location.pathname]);
}

// Hook for smart navigation with prefetch
export function useSmartNavigate() {
  const navigate = useNavigate();

  const smartNavigate = useCallback(
    async (to: string, options?: { replace?: boolean }) => {
      // Prefetch before navigation if not already done
      await prefetchRoute(to);
      navigate(to, options);
    },
    [navigate]
  );

  return smartNavigate;
}

// Component wrapper for Link with prefetch
export function usePrefetchableLink(to: string) {
  const prefetchProps = usePrefetchLink(to);
  const navigate = useNavigate();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      navigate(to);
    },
    [navigate, to]
  );

  return {
    ...prefetchProps,
    onClick: handleClick,
    href: to,
  };
}

// Prefetch on idle
export function prefetchOnIdle(routes: string[]): void {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(
      () => {
        prefetchRoutes(routes);
      },
      { timeout: 2000 }
    );
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      prefetchRoutes(routes);
    }, 100);
  }
}

// Hook to prefetch critical routes on app load
export function usePrefetchCriticalRoutes() {
  useEffect(() => {
    prefetchOnIdle(["/dashboard", "/profile", "/quests"]);
  }, []);
}
