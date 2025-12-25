/**
 * Error Tracking Service - Sistema centralizado de rastreamento de erros
 * Captura, categoriza e reporta erros da aplicação
 */

import { logger } from "@/services/loggingService";

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'auth' | 'validation' | 'runtime' | 'ui' | 'unknown';

export interface TrackedError {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: Record<string, unknown>;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  handled: boolean;
}

interface ErrorTrackingConfig {
  maxErrors: number;
  reportToConsole: boolean;
  captureUnhandled: boolean;
}

const DEFAULT_CONFIG: ErrorTrackingConfig = {
  maxErrors: 50,
  reportToConsole: true,
  captureUnhandled: true,
};

class ErrorTrackingService {
  private errors: TrackedError[] = [];
  private config: ErrorTrackingConfig;
  private sessionId: string;
  private userId?: string;
  private initialized = false;

  constructor(config: Partial<ErrorTrackingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Inicializa captura de erros globais
   */
  init(): void {
    if (this.initialized) return;

    if (this.config.captureUnhandled) {
      // Captura erros não tratados
      window.addEventListener('error', (event) => {
        this.captureError(event.error || new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      // Captura promises rejeitadas
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error 
          ? event.reason 
          : new Error(String(event.reason));
        this.captureError(error, { type: 'unhandledRejection' });
      });
    }

    this.initialized = true;
    logger.info('Error tracking initialized', 'ErrorTracking');
  }

  /**
   * Define o usuário atual
   */
  setUser(userId: string | undefined): void {
    this.userId = userId;
  }

  /**
   * Captura um erro
   */
  captureError(
    error: Error | string,
    context: Record<string, unknown> = {},
    severity?: ErrorSeverity
  ): TrackedError {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    const trackedError: TrackedError = {
      id: this.generateErrorId(),
      message: errorObj.message,
      stack: errorObj.stack,
      severity: severity || this.determineSeverity(errorObj),
      category: this.categorizeError(errorObj),
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
      handled: severity !== undefined,
    };

    this.addError(trackedError);

    if (this.config.reportToConsole) {
      this.logError(trackedError);
    }

    return trackedError;
  }

  /**
   * Captura erro de rede/API
   */
  captureNetworkError(
    url: string,
    status: number,
    message: string,
    context: Record<string, unknown> = {}
  ): TrackedError {
    return this.captureError(
      new Error(`Network error: ${status} ${message}`),
      { ...context, url, status, type: 'network' },
      status >= 500 ? 'high' : 'medium'
    );
  }

  /**
   * Captura erro de autenticação
   */
  captureAuthError(message: string, context: Record<string, unknown> = {}): TrackedError {
    return this.captureError(
      new Error(`Auth error: ${message}`),
      { ...context, type: 'auth' },
      'medium'
    );
  }

  /**
   * Captura erro de validação
   */
  captureValidationError(
    field: string,
    message: string,
    context: Record<string, unknown> = {}
  ): TrackedError {
    return this.captureError(
      new Error(`Validation error: ${field} - ${message}`),
      { ...context, field, type: 'validation' },
      'low'
    );
  }

  private addError(error: TrackedError): void {
    this.errors.push(error);
    
    // Limita quantidade de erros armazenados
    if (this.errors.length > this.config.maxErrors) {
      this.errors = this.errors.slice(-this.config.maxErrors);
    }
  }

  private determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }
    if (message.includes('failed') || message.includes('error')) {
      return 'high';
    }
    if (message.includes('warning') || message.includes('timeout')) {
      return 'medium';
    }
    return 'low';
  }

  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch') || message.includes('xhr')) {
      return 'network';
    }
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'auth';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (stack.includes('react') || message.includes('render')) {
      return 'ui';
    }
    if (error instanceof TypeError || error instanceof ReferenceError) {
      return 'runtime';
    }
    return 'unknown';
  }

  private logError(error: TrackedError): void {
    const prefix = `[${error.severity.toUpperCase()}][${error.category}]`;
    logger.error(`${prefix} ${error.message}`, 'ErrorTracking', {
      id: error.id,
      context: error.context,
    });
  }

  /**
   * Obtém erros recentes
   */
  getRecentErrors(count = 20): TrackedError[] {
    return this.errors.slice(-count);
  }

  /**
   * Obtém erros por severidade
   */
  getErrorsBySeverity(severity: ErrorSeverity): TrackedError[] {
    return this.errors.filter(e => e.severity === severity);
  }

  /**
   * Obtém estatísticas de erros
   */
  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {
      total: this.errors.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const error of this.errors) {
      stats[error.severity]++;
    }

    return stats;
  }

  /**
   * Limpa erros
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Nova sessão
   */
  newSession(): void {
    this.sessionId = this.generateSessionId();
    this.clearErrors();
  }
}

// Singleton
export const errorTracker = new ErrorTrackingService();

// Auto-init
if (typeof window !== 'undefined') {
  errorTracker.init();
}

export default errorTracker;
