/**
 * Centralized Logging Service
 * Provides consistent error handling and logging across the application.
 *
 * Features:
 * - PII redaction for sensitive fields (email, password, cpf, phone, token)
 * - External error tracking integration point (Sentry, DataDog, etc.)
 * - Structured log entries with context and timestamp
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: string;
}

/**
 * Callback type for external log shipping integration.
 * Set via `logger.setExternalHandler()` to forward logs to services like Sentry.
 */
type ExternalLogHandler = (entry: LogEntry) => void;

const isDev = import.meta.env.DEV;

// Fields that should be redacted from log data to prevent PII leakage
const PII_FIELDS = new Set([
  'password', 'senha', 'secret', 'token', 'totp_secret',
  'backup_codes', 'cpf', 'phone', 'telefone', 'personal_email',
  'api_key', 'api_secret', 'authorization', 'cookie',
]);

/**
 * Recursively redacts PII fields from objects before logging.
 */
function redactPII(data: unknown, depth = 0): unknown {
  if (depth > 5 || data === null || data === undefined) return data;

  if (typeof data === 'string') return data;

  if (Array.isArray(data)) {
    return data.map(item => redactPII(item, depth + 1));
  }

  if (typeof data === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (PII_FIELDS.has(key.toLowerCase())) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactPII(value, depth + 1);
      }
    }
    return redacted;
  }

  return data;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private maxLogs = 200;
  private externalHandler: ExternalLogHandler | null = null;

  /**
   * Register an external log handler for production error tracking.
   * Example: logger.setExternalHandler((entry) => Sentry.captureMessage(entry.message));
   */
  setExternalHandler(handler: ExternalLogHandler): void {
    this.externalHandler = handler;
  }

  private createEntry(level: LogLevel, message: string, context?: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      context,
      data: redactPII(data),
      timestamp: new Date().toISOString(),
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Forward to external handler for error/warn levels in production
    if (this.externalHandler && (entry.level === 'error' || entry.level === 'warn')) {
      try {
        this.externalHandler(entry);
      } catch {
        // Prevent external handler errors from breaking the app
      }
    }
  }

  private formatMessage(context: string | undefined, message: string): string {
    return context ? `[${context}] ${message}` : message;
  }

  debug(message: string, context?: string, data?: unknown): void {
    if (isDev) {
      const entry = this.createEntry('debug', message, context, data);
      this.addLog(entry);
      console.debug(this.formatMessage(context, message), data ?? '');
    }
  }

  info(message: string, context?: string, data?: unknown): void {
    const entry = this.createEntry('info', message, context, data);
    this.addLog(entry);
    if (isDev) {
      console.info(this.formatMessage(context, message), data ?? '');
    }
  }

  warn(message: string, context?: string, data?: unknown): void {
    const entry = this.createEntry('warn', message, context, data);
    this.addLog(entry);
    console.warn(this.formatMessage(context, message), data ?? '');
  }

  error(message: string, context?: string, error?: unknown): void {
    const entry = this.createEntry('error', message, context, error);
    this.addLog(entry);
    console.error(this.formatMessage(context, message), error ?? '');
  }

  /**
   * Log an API/async operation error with standardized format
   */
  apiError(operation: string, error: unknown, context?: string): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.error(`${operation} failed: ${errorMessage}`, context, error);
  }

  /**
   * Get recent logs (useful for debugging)
   */
  getRecentLogs(count = 20): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel, count = 50): LogEntry[] {
    return this.logs.filter(l => l.level === level).slice(-count);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new LoggingService();
