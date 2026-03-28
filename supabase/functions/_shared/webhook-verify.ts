/**
 * Webhook signature verification for inbound webhooks.
 * Verifies HMAC-SHA256 signature to ensure payload integrity.
 *
 * Usage in Edge Functions:
 *   const isValid = await verifyWebhookSignature(req, "whsec_xxx");
 */

export async function verifyWebhookSignature(
  req: Request,
  secret: string,
  signatureHeader = "x-webhook-signature"
): Promise<{ valid: boolean; body: string }> {
  const signature = req.headers.get(signatureHeader);
  const body = await req.text();

  if (!signature) {
    return { valid: false, body };
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison to prevent timing attacks
  const valid = signature.length === expectedSignature.length &&
    timingSafeEqual(signature, expectedSignature);

  return { valid, body };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
