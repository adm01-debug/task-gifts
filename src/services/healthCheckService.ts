/**
 * Health Check Service
 * Monitora saúde da aplicação e conectividade com serviços
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggingService";

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  latency?: number;
  lastCheck: string;
  message?: string;
}

export interface HealthReport {
  overall: HealthStatus;
  services: ServiceHealth[];
  timestamp: string;
  uptime: number;
}

interface HealthCheckConfig {
  interval: number;
  timeout: number;
}

const DEFAULT_CONFIG: HealthCheckConfig = {
  interval: 60000, // 1 minute
  timeout: 5000, // 5 seconds
};

class HealthCheckService {
  private config: HealthCheckConfig;
  private startTime: number;
  private lastReport: HealthReport | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Set<(report: HealthReport) => void> = new Set();

  constructor(config: Partial<HealthCheckConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startTime = Date.now();
  }

  /**
   * Inicia monitoramento contínuo
   */
  start(): void {
    if (this.intervalId) return;

    // Check immediately
    this.runHealthCheck();

    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.runHealthCheck();
    }, this.config.interval);

    logger.info('Health check monitoring started', 'HealthCheck');
  }

  /**
   * Para monitoramento
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Executa verificação de saúde completa
   */
  async runHealthCheck(): Promise<HealthReport> {
    const services: ServiceHealth[] = [];

    // Check Supabase/Database
    services.push(await this.checkDatabase());

    // Check Network
    services.push(await this.checkNetwork());

    // Check Local Storage
    services.push(this.checkLocalStorage());

    // Determine overall status
    const overall = this.determineOverallStatus(services);

    const report: HealthReport = {
      overall,
      services,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
    };

    this.lastReport = report;
    this.notifyListeners(report);

    if (overall !== 'healthy') {
      logger.warn(`Health check: ${overall}`, 'HealthCheck', { services });
    }

    return report;
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    const start = performance.now();
    
    try {
      // Simple query to check database connectivity
      const { error } = await Promise.race([
        supabase.from('profiles').select('id').limit(1),
        new Promise<{ error: Error }>((_, reject) => 
          setTimeout(() => reject({ error: new Error('Timeout') }), this.config.timeout)
        ),
      ]);

      const latency = performance.now() - start;

      if (error) {
        return {
          name: 'Database',
          status: 'unhealthy',
          latency,
          lastCheck: new Date().toISOString(),
          message: error.message,
        };
      }

      return {
        name: 'Database',
        status: latency > 2000 ? 'degraded' : 'healthy',
        latency,
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: 'Database',
        status: 'unhealthy',
        latency: performance.now() - start,
        lastCheck: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkNetwork(): Promise<ServiceHealth> {
    const start = performance.now();

    try {
      // Check if online
      if (!navigator.onLine) {
        return {
          name: 'Network',
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          message: 'Offline',
        };
      }

      // Try to fetch a small resource
      const response = await Promise.race([
        fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' }),
        new Promise<Response>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
        ),
      ]);

      const latency = performance.now() - start;

      return {
        name: 'Network',
        status: response.ok ? (latency > 1000 ? 'degraded' : 'healthy') : 'degraded',
        latency,
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: 'Network',
        status: navigator.onLine ? 'degraded' : 'unhealthy',
        latency: performance.now() - start,
        lastCheck: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Network check failed',
      };
    }
  }

  private checkLocalStorage(): ServiceHealth {
    try {
      const testKey = '__health_check_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);

      return {
        name: 'LocalStorage',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: 'LocalStorage',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Storage unavailable',
      };
    }
  }

  private determineOverallStatus(services: ServiceHealth[]): HealthStatus {
    const statuses = services.map(s => s.status);

    if (statuses.every(s => s === 'healthy')) return 'healthy';
    if (statuses.some(s => s === 'unhealthy')) return 'unhealthy';
    if (statuses.some(s => s === 'degraded')) return 'degraded';
    return 'unknown';
  }

  private notifyListeners(report: HealthReport): void {
    for (const listener of this.listeners) {
      try {
        listener(report);
      } catch (error) {
        logger.error('Health check listener error', 'HealthCheck', error);
      }
    }
  }

  /**
   * Subscribe to health reports
   */
  subscribe(callback: (report: HealthReport) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get last report
   */
  getLastReport(): HealthReport | null {
    return this.lastReport;
  }

  /**
   * Get uptime
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Check if healthy
   */
  isHealthy(): boolean {
    return this.lastReport?.overall === 'healthy';
  }
}

// Singleton
export const healthCheck = new HealthCheckService();

// Auto-start in browser
if (typeof window !== 'undefined') {
  healthCheck.start();
}

export default healthCheck;
