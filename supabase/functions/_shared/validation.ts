/**
 * Input validation helpers for Edge Functions.
 * Lightweight validation without external dependencies (Zod not available in Deno).
 */

export function validateRequired(obj: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

export function validateEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateUUID(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function validateNumberRange(value: unknown, min: number, max: number): boolean {
  if (typeof value !== "number") return false;
  return value >= min && value <= max;
}

export function validateStringLength(value: unknown, min: number, max: number): boolean {
  if (typeof value !== "string") return false;
  return value.length >= min && value.length <= max;
}

/**
 * Limits request body size. Returns parsed JSON or throws.
 */
export async function parseBodyWithLimit(req: Request, maxBytes: number = 1_000_000): Promise<Record<string, unknown>> {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > maxBytes) {
    throw new Error(`Payload too large: ${contentLength} bytes (max: ${maxBytes})`);
  }
  const text = await req.text();
  if (text.length > maxBytes) {
    throw new Error(`Payload too large: ${text.length} chars (max: ${maxBytes})`);
  }
  return JSON.parse(text);
}
