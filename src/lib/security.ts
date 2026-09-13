import crypto from "crypto";

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET (or NEXTAUTH_SECRET) must be set to a strong value of at least 32 characters.");
  }
  return secret;
}

// Rate limiting is process-local. Use a shared store such as Redis for multi-instance deployments.
const rateLimitStore = new Map<string, { attempts: number; resetTime: number }>();
const loginAttemptsStore = new Map<string, { attempts: number; lockUntil: number }>();

export function generateSecureToken(payload: Record<string, any>): string {
  const timestamp = Date.now();
  const data = JSON.stringify({ ...payload, iat: timestamp });
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(`${timestamp}:${data}`)
    .digest("hex");

  return `${timestamp}.${Buffer.from(data).toString("base64url")}.${signature}`;
}

export function verifySecureToken(token: string): Record<string, any> | null {
  try {
    const [timestampStr, dataB64, signature] = token.split(".");
    if (!timestampStr || !dataB64 || !signature) return null;

    const timestamp = Number(timestampStr);
    if (!Number.isFinite(timestamp)) return null;

    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge || timestamp > Date.now() + 60_000) return null;

    const data = Buffer.from(dataB64, "base64url").toString("utf-8");
    const expectedSignature = crypto
      .createHmac("sha256", getAuthSecret())
      .update(`${timestamp}:${data}`)
      .digest("hex");

    if (!timingSafeCompare(signature, expectedSignature)) return null;

    const parsed = JSON.parse(data);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyCsrfToken(token: string, storedToken: string): boolean {
  return timingSafeCompare(token, storedToken);
}

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { attempts: 1, resetTime });
    return { allowed: true, remaining: Math.max(0, maxAttempts - 1), resetTime };
  }

  if (record.attempts >= maxAttempts) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.attempts += 1;
  return { allowed: true, remaining: Math.max(0, maxAttempts - record.attempts), resetTime: record.resetTime };
}

export function trackLoginAttempt(identifier: string): {
  locked: boolean;
  remainingAttempts: number;
  lockDuration: number;
} {
  const now = Date.now();
  const record = loginAttemptsStore.get(identifier);

  if (!record || now > record.lockUntil) {
    loginAttemptsStore.set(identifier, { attempts: 1, lockUntil: 0 });
    return { locked: false, remainingAttempts: 4, lockDuration: 0 };
  }

  if (record.lockUntil > now) {
    return { locked: true, remainingAttempts: 0, lockDuration: record.lockUntil - now };
  }

  const newAttempts = record.attempts + 1;
  if (newAttempts >= 5) {
    const lockDuration = Math.min(
      15 * 60 * 1000 * Math.pow(2, Math.floor(newAttempts / 5) - 1),
      24 * 60 * 60 * 1000
    );
    record.attempts = newAttempts;
    record.lockUntil = now + lockDuration;
    return { locked: true, remainingAttempts: 0, lockDuration };
  }

  record.attempts = newAttempts;
  return { locked: false, remainingAttempts: 5 - newAttempts, lockDuration: 0 };
}

export function resetLoginAttempts(identifier: string): void {
  loginAttemptsStore.delete(identifier);
}

export async function hashPassword(password: string): Promise<string> {
  const bcryptjs = (await import("bcryptjs")).default;
  return bcryptjs.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcryptjs = (await import("bcryptjs")).default;
  return bcryptjs.compare(password, hash);
}

export function generateRandomToken(length: number = 48): string {
  return crypto.randomBytes(length).toString("hex");
}

function timingSafeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function generateRequestSignature(method: string, path: string, timestamp: string, body: string): string {
  const payload = `${method}:${path}:${timestamp}:${body}`;
  return crypto.createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, "").trim().slice(0, 500);
}

export function getClientIP(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const realIP = headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIP || "unknown";
}

export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };
}
