/**
 * Distributed tracing support for Edge Functions.
 * Extracts or generates a request ID and includes it in all responses.
 */

export function getRequestId(req: Request): string {
  return req.headers.get("x-request-id") ||
    `edge_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function addTracingHeaders(
  headers: Record<string, string>,
  requestId: string
): Record<string, string> {
  return {
    ...headers,
    "x-request-id": requestId,
  };
}
