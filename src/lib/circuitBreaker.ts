/**
 * Simple circuit breaker for external integrations.
 *
 * States: CLOSED (normal) → OPEN (failing, reject fast) → HALF_OPEN (test one request)
 *
 * Usage:
 *   const bitrixBreaker = new CircuitBreaker("bitrix24", { failureThreshold: 3, resetTimeoutMs: 30000 });
 *   const result = await bitrixBreaker.execute(() => fetch("https://bitrix.example.com/api"));
 */

import { logger } from "@/services/loggingService";

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitBreakerOptions {
  failureThreshold: number;  // failures before opening
  resetTimeoutMs: number;    // ms before trying half-open
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly name: string;
  private readonly options: CircuitBreakerOptions;

  constructor(name: string, options: Partial<CircuitBreakerOptions> = {}) {
    this.name = name;
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      resetTimeoutMs: options.resetTimeoutMs ?? 30_000,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeoutMs) {
        this.state = "HALF_OPEN";
        logger.info(`Circuit ${this.name}: HALF_OPEN (testing)`, "circuitBreaker");
      } else {
        throw new Error(`Circuit ${this.name} is OPEN — service unavailable`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    if (this.state === "HALF_OPEN") {
      logger.info(`Circuit ${this.name}: CLOSED (recovered)`, "circuitBreaker");
    }
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = "OPEN";
      logger.warn(
        `Circuit ${this.name}: OPEN after ${this.failureCount} failures`,
        "circuitBreaker"
      );
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset() {
    this.state = "CLOSED";
    this.failureCount = 0;
  }
}
