/**
 * Analytics Service - Sistema de analytics e métricas
 * Rastreia eventos, performance e comportamento do usuário
 */

export type EventCategory = 'navigation' | 'interaction' | 'engagement' | 'conversion' | 'error' | 'performance';

export interface AnalyticsEvent {
  name: string;
  category: EventCategory;
  properties?: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
  userId?: string;
  path: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 's' | 'bytes' | 'count';
  timestamp: string;
  context?: Record<string, unknown>;
}

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  maxEvents: number;
  flushInterval: number;
}

const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: true,
  debug: import.meta.env.DEV,
  maxEvents: 100,
  flushInterval: 30000,
};

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private config: AnalyticsConfig;
  private sessionId: string;
  private userId?: string;
  private sessionStart: number;
  private pageViews: Map<string, number> = new Map();

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Define o usuário atual
   */
  setUser(userId: string | undefined): void {
    this.userId = userId;
    if (userId) {
      this.track('user_identified', 'engagement', { userId });
    }
  }

  /**
   * Rastreia um evento
   */
  track(
    name: string,
    category: EventCategory = 'interaction',
    properties?: Record<string, unknown>
  ): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      name,
      category,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      path: window.location.pathname,
    };

    this.events.push(event);
    this.trimEvents();

    if (this.config.debug) {
      console.log('[Analytics]', name, properties);
    }
  }

  /**
   * Rastreia visualização de página
   */
  trackPageView(path: string, title?: string): void {
    const views = this.pageViews.get(path) || 0;
    this.pageViews.set(path, views + 1);

    this.track('page_view', 'navigation', {
      path,
      title: title || document.title,
      referrer: document.referrer,
      viewCount: views + 1,
    });
  }

  /**
   * Rastreia clique
   */
  trackClick(elementId: string, label?: string, properties?: Record<string, unknown>): void {
    this.track('click', 'interaction', {
      elementId,
      label,
      ...properties,
    });
  }

  /**
   * Rastreia busca
   */
  trackSearch(query: string, resultsCount: number): void {
    this.track('search', 'interaction', {
      query: query.slice(0, 100),
      resultsCount,
    });
  }

  /**
   * Rastreia conversão/ação importante
   */
  trackConversion(name: string, value?: number, properties?: Record<string, unknown>): void {
    this.track(name, 'conversion', {
      value,
      ...properties,
    });
  }

  /**
   * Rastreia erro
   */
  trackError(message: string, stack?: string, context?: Record<string, unknown>): void {
    this.track('error', 'error', {
      message: message.slice(0, 500),
      stack: stack?.slice(0, 1000),
      ...context,
    });
  }

  /**
   * Registra métrica de performance
   */
  recordMetric(
    name: string,
    value: number,
    unit: PerformanceMetric['unit'] = 'ms',
    context?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      context,
    };

    this.metrics.push(metric);

    if (this.config.debug) {
      console.log('[Metric]', name, value, unit);
    }
  }

  /**
   * Mede tempo de execução
   */
  measureTime<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    this.recordMetric(name, duration, 'ms');
    return result;
  }

  /**
   * Mede tempo de execução async
   */
  async measureTimeAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    this.recordMetric(name, duration, 'ms');
    return result;
  }

  /**
   * Obtém duração da sessão
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStart;
  }

  /**
   * Obtém estatísticas da sessão
   */
  getSessionStats(): Record<string, unknown> {
    const eventsByCategory: Record<string, number> = {};
    
    for (const event of this.events) {
      eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
    }

    return {
      sessionId: this.sessionId,
      duration: this.getSessionDuration(),
      totalEvents: this.events.length,
      eventsByCategory,
      pageViews: Object.fromEntries(this.pageViews),
      metricsCount: this.metrics.length,
    };
  }

  /**
   * Obtém eventos recentes
   */
  getRecentEvents(count = 20): AnalyticsEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Obtém métricas recentes
   */
  getRecentMetrics(count = 20): PerformanceMetric[] {
    return this.metrics.slice(-count);
  }

  private trimEvents(): void {
    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-this.config.maxEvents);
    }
    if (this.metrics.length > this.config.maxEvents) {
      this.metrics = this.metrics.slice(-this.config.maxEvents);
    }
  }

  /**
   * Nova sessão
   */
  newSession(): void {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.events = [];
    this.metrics = [];
    this.pageViews.clear();
  }
}

// Singleton
export const analytics = new AnalyticsService();

export default analytics;
