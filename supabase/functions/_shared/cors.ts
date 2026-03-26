/**
 * Shared CORS headers for Supabase Edge Functions.
 *
 * Uses a whitelist of allowed origins instead of wildcard '*'.
 * Falls back to the Supabase project URL if no origin matches.
 */

const ALLOWED_ORIGINS: string[] = [
  "https://rvwpdecdopqqyvhdhsam.supabase.co",
  // Add production domain(s) here:
  // "https://app.gamificarh.com.br",
  // "https://gamificarh.com.br",
];

// Allow localhost in development
const DEV_ORIGINS: RegExp[] = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/.*\.lovable\.dev$/,
  /^https?:\/\/.*\.lovableproject\.com$/,
];

/**
 * Returns the appropriate Access-Control-Allow-Origin header value.
 * If the request origin is in the allowlist, it is reflected back.
 * Otherwise, the first allowed origin is used (restricting access).
 */
export function getAllowedOrigin(requestOrigin: string | null): string {
  if (!requestOrigin) {
    return ALLOWED_ORIGINS[0] || "*";
  }

  // Check exact match
  if (ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Check dev patterns
  if (DEV_ORIGINS.some(pattern => pattern.test(requestOrigin))) {
    return requestOrigin;
  }

  // Default: restrict to first allowed origin
  return ALLOWED_ORIGINS[0] || "*";
}

/**
 * Returns CORS headers with origin-specific Access-Control-Allow-Origin.
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(origin),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key, x-api-secret, x-webhook-signature",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

/**
 * Handles CORS preflight (OPTIONS) requests.
 */
export function handleCorsPreflightIfNeeded(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  return null;
}
