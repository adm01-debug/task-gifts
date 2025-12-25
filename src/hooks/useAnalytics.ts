/**
 * useAnalytics - Hook para analytics em componentes
 */

import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { analytics, EventCategory } from "@/services/analyticsService";

interface UseAnalyticsOptions {
  trackPageView?: boolean;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { trackPageView = true } = options;
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  // Track page views on route change
  useEffect(() => {
    if (trackPageView && location.pathname !== prevPath.current) {
      analytics.trackPageView(location.pathname);
      prevPath.current = location.pathname;
    }
  }, [location.pathname, trackPageView]);

  const track = useCallback((
    name: string,
    category?: EventCategory,
    properties?: Record<string, unknown>
  ) => {
    analytics.track(name, category, properties);
  }, []);

  const trackClick = useCallback((
    elementId: string,
    label?: string,
    properties?: Record<string, unknown>
  ) => {
    analytics.trackClick(elementId, label, properties);
  }, []);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    analytics.trackSearch(query, resultsCount);
  }, []);

  const trackConversion = useCallback((
    name: string,
    value?: number,
    properties?: Record<string, unknown>
  ) => {
    analytics.trackConversion(name, value, properties);
  }, []);

  const recordMetric = useCallback((
    name: string,
    value: number,
    unit?: 'ms' | 's' | 'bytes' | 'count'
  ) => {
    analytics.recordMetric(name, value, unit);
  }, []);

  const measureTime = useCallback(<T,>(name: string, fn: () => T): T => {
    return analytics.measureTime(name, fn);
  }, []);

  const measureTimeAsync = useCallback(async <T,>(name: string, fn: () => Promise<T>): Promise<T> => {
    return analytics.measureTimeAsync(name, fn);
  }, []);

  return {
    track,
    trackClick,
    trackSearch,
    trackConversion,
    recordMetric,
    measureTime,
    measureTimeAsync,
    getSessionStats: analytics.getSessionStats.bind(analytics),
  };
}

/**
 * useComponentMetrics - Métricas de performance de componente
 */
export function useComponentMetrics(componentName: string) {
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    analytics.recordMetric(`${componentName}_mount`, mountTime.current, 'ms');

    return () => {
      const lifetime = performance.now() - mountTime.current;
      analytics.recordMetric(`${componentName}_lifetime`, lifetime, 'ms');
    };
  }, [componentName]);

  const trackRender = useCallback(() => {
    analytics.recordMetric(`${componentName}_render`, performance.now(), 'ms');
  }, [componentName]);

  return { trackRender };
}

export default useAnalytics;
