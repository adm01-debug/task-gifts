/**
 * Simple in-memory rate limiter for Supabase Edge Functions
 * Uses a sliding window approach with configurable limits
 */

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (resets on cold starts, which is acceptable)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 60 seconds
setInterval(cleanupExpiredEntries, 60000);

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP, user ID)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining/reset info
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): { allowed: boolean; remaining: number; resetAt: number; retryAfter?: number } {
  const now = Date.now();
  const key = identifier;
  
  let entry = rateLimitStore.get(key);
  
  // If no entry or expired, create new one
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + config.windowMs
    };
    rateLimitStore.set(key, entry);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: entry.resetAt
    };
  }
  
  // Increment count
  entry.count++;
  
  // Check if over limit
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter
    };
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt
  };
}

/**
 * Get rate limit identifier from request
 * Uses user ID from auth header if available, otherwise falls back to IP
 */
export function getRateLimitIdentifier(req: Request, functionName: string): string {
  // Try to get user ID from authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    // Extract JWT and decode to get user ID (basic extraction)
    const token = authHeader.replace("Bearer ", "");
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.sub) {
        return `${functionName}:user:${payload.sub}`;
      }
    } catch {
      // Failed to parse token, fall through to IP
    }
  }
  
  // Fall back to IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `${functionName}:ip:${ip}`;
}

/**
 * Create a rate limit error response
 */
export function createRateLimitResponse(
  retryAfter: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: "Limite de requisições excedido",
      message: `Por favor, aguarde ${retryAfter} segundos antes de tentar novamente.`,
      retryAfter
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter)
      }
    }
  );
}

/**
 * Default rate limit configurations for different function types
 */
export const RATE_LIMITS = {
  // AI-powered functions (expensive, limit strictly)
  ai: { windowMs: 60000, maxRequests: 10 },
  
  // Standard API endpoints
  standard: { windowMs: 60000, maxRequests: 30 },
  
  // Read-heavy endpoints
  read: { windowMs: 60000, maxRequests: 60 },
  
  // Auth-related endpoints (stricter to prevent brute force)
  auth: { windowMs: 60000, maxRequests: 5 },
  
  // Webhook endpoints (more lenient for external services)
  webhook: { windowMs: 60000, maxRequests: 100 }
} as const;
