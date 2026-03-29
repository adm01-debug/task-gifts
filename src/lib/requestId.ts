/**
 * Request ID correlation for distributed tracing.
 * Generates a unique ID per user action and propagates it through
 * Supabase calls via custom headers.
 */

let currentRequestId: string | null = null;

export function generateRequestId(): string {
  const id = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  currentRequestId = id;
  return id;
}

export function getCurrentRequestId(): string | null {
  return currentRequestId;
}

export function clearRequestId(): void {
  currentRequestId = null;
}

/**
 * Wraps an async operation with request ID tracking.
 * The ID is available via getCurrentRequestId() during execution.
 */
export async function withRequestId<T>(fn: () => Promise<T>): Promise<T> {
  const id = generateRequestId();
  try {
    return await fn();
  } finally {
    if (currentRequestId === id) {
      clearRequestId();
    }
  }
}
