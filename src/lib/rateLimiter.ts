/**
 * Rate Limiter - Controla frequência de ações do usuário
 * Previne spam de requisições e ações repetidas
 */

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

class RateLimiter {
  private entries: Map<string, RateLimitEntry> = new Map();
  private blocked: Map<string, number> = new Map();

  /**
   * Verifica se a ação pode ser executada
   */
  canExecute(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    
    // Check if blocked
    const blockedUntil = this.blocked.get(key);
    if (blockedUntil && now < blockedUntil) {
      return false;
    }
    
    // Clear expired block
    if (blockedUntil && now >= blockedUntil) {
      this.blocked.delete(key);
    }

    const entry = this.entries.get(key);
    
    if (!entry) {
      return true;
    }

    // Check if window has expired
    if (now - entry.firstRequest > config.windowMs) {
      this.entries.delete(key);
      return true;
    }

    // Check if limit exceeded
    return entry.count < config.maxRequests;
  }

  /**
   * Registra uma execução
   */
  recordExecution(key: string, config: RateLimitConfig): void {
    const now = Date.now();
    const entry = this.entries.get(key);

    if (!entry || now - entry.firstRequest > config.windowMs) {
      this.entries.set(key, {
        count: 1,
        firstRequest: now,
        lastRequest: now,
      });
      return;
    }

    entry.count++;
    entry.lastRequest = now;

    // Block if limit exceeded
    if (entry.count >= config.maxRequests && config.blockDurationMs) {
      this.blocked.set(key, now + config.blockDurationMs);
    }
  }

  /**
   * Executa com rate limiting
   */
  execute<T>(
    key: string,
    config: RateLimitConfig,
    action: () => T
  ): T | null {
    if (!this.canExecute(key, config)) {
      return null;
    }

    this.recordExecution(key, config);
    return action();
  }

  /**
   * Executa async com rate limiting
   */
  async executeAsync<T>(
    key: string,
    config: RateLimitConfig,
    action: () => Promise<T>
  ): Promise<T | null> {
    if (!this.canExecute(key, config)) {
      return null;
    }

    this.recordExecution(key, config);
    return action();
  }

  /**
   * Obtém tempo restante até poder executar novamente
   */
  getTimeUntilReset(key: string, config: RateLimitConfig): number {
    const now = Date.now();
    
    // Check blocked
    const blockedUntil = this.blocked.get(key);
    if (blockedUntil && now < blockedUntil) {
      return blockedUntil - now;
    }

    const entry = this.entries.get(key);
    if (!entry) return 0;

    const windowEnd = entry.firstRequest + config.windowMs;
    return Math.max(0, windowEnd - now);
  }

  /**
   * Limpa entradas expiradas
   */
  cleanup(): void {
    const now = Date.now();
    
    // Cleanup entries older than 1 hour
    for (const [key, entry] of this.entries) {
      if (now - entry.lastRequest > 3600000) {
        this.entries.delete(key);
      }
    }

    // Cleanup expired blocks
    for (const [key, blockedUntil] of this.blocked) {
      if (now >= blockedUntil) {
        this.blocked.delete(key);
      }
    }
  }

  /**
   * Reset para um key específico
   */
  reset(key: string): void {
    this.entries.delete(key);
    this.blocked.delete(key);
  }

  /**
   * Reset all
   */
  resetAll(): void {
    this.entries.clear();
    this.blocked.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Preset configs
export const rateLimitConfigs = {
  // API calls: 60 per minute
  api: {
    maxRequests: 60,
    windowMs: 60000,
    blockDurationMs: 30000,
  },
  // Form submissions: 5 per minute
  formSubmit: {
    maxRequests: 5,
    windowMs: 60000,
    blockDurationMs: 60000,
  },
  // Search: 30 per minute
  search: {
    maxRequests: 30,
    windowMs: 60000,
  },
  // Login attempts: 5 per 15 minutes
  login: {
    maxRequests: 5,
    windowMs: 900000,
    blockDurationMs: 900000,
  },
  // Button clicks: 10 per 10 seconds (prevent spam)
  buttonClick: {
    maxRequests: 10,
    windowMs: 10000,
  },
} as const;

// Cleanup every 5 minutes
setInterval(() => rateLimiter.cleanup(), 300000);

export default rateLimiter;
