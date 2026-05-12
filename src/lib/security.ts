import crypto from "crypto";

const HMAC_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "snapforest-secure-jwt-hmac-secret-key-2024";

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { attempts: number; resetTime: number }>();

// Login attempt tracking for brute force protection
const loginAttemptsStore = new Map<string, { attempts: number; lockUntil: number }>();

/**
 * Generate HMAC-SHA256 signed token - tamper-proof
 * Format: timestamp:payload:signature
 */
export function generateSecureToken(payload: Record<string, any>): string {
  const timestamp = Date.now();
  const data = JSON.stringify({ ...payload, iat: timestamp });
  const signature = crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(`${timestamp}:${data}`)
    .digest("hex");
  
  return `${timestamp}.${Buffer.from(data).toString("base64")}.${signature}`;
}

/**
 * Verify HMAC-SHA256 signed token
 * Returns decoded payload or null if invalid
 */
export function verifySecureToken(token: string): Record<string, any> | null {
  try {
    const [timestampStr, dataB64, signature] = token.split(".");
    if (!timestampStr || !dataB64 || !signature) return null;

    const timestamp = parseInt(timestampStr);
    // Token expires after 7 days
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) return null;

    const data = Buffer.from(dataB64, "base64").toString("utf-8");
    const expectedSignature = crypto
      .createHmac("sha256", HMAC_SECRET)
      .update(`${timestamp}:${data}`)
      .digest("hex");

    // Constant-time comparison to prevent timing attacks
    if (!timingSafeCompare(signature, expectedSignature)) return null;

    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token: string, storedToken: string): boolean {
  return timingSafeCompare(token, storedToken);
}

/**
 * Rate limiting check
 * Returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(key, { attempts: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs };
  }

  if (record.attempts >= maxAttempts) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.attempts++;
  return { allowed: true, remaining: maxAttempts - record.attempts, resetTime: record.resetTime };
}

/**
 * Brute force protection - track login attempts per IP/email
 */
export function trackLoginAttempt(identifier: string): {
  locked: boolean;
  remainingAttempts: number;
  lockDuration: number;
} {
  const now = Date.now();
  const record = loginAttemptsStore.get(identifier);

  if (!record || now > record.lockUntil) {
    // First attempt or lock expired
    loginAttemptsStore.set(identifier, { attempts: 1, lockUntil: 0 });
    return { locked: false, remainingAttempts: 4, lockDuration: 0 };
  }

  // Currently locked
  if (record.lockUntil > now) {
    return {
      locked: true,
      remainingAttempts: 0,
      lockDuration: record.lockUntil - now,
    };
  }

  const newAttempts = record.attempts + 1;

  // Lock after 5 failed attempts - progressive lockout
  if (newAttempts >= 5) {
    const lockDuration = Math.min(
      15 * 60 * 1000 * Math.pow(2, Math.floor(newAttempts / 5) - 1), // Progressive: 15min, 30min, 60min...
      24 * 60 * 60 * 1000 // Max 24 hours
    );
    record.attempts = newAttempts;
    record.lockUntil = now + lockDuration;
    return { locked: true, remainingAttempts: 0, lockDuration };
  }

  record.attempts = newAttempts;
  return {
    locked: false,
    remainingAttempts: 5 - newAttempts,
    lockDuration: 0,
  };
}

/**
 * Reset login attempts on successful login
 */
export function resetLoginAttempts(identifier: string): void {
  loginAttemptsStore.delete(identifier);
}

/**
 * Hash password with bcrypt (salt rounds = 12)
 */
export async function hashPassword(password: string): Promise<string> {
  const bcryptjs = (await import("bcryptjs")).default;
  return bcryptjs.hash(password, 12);
}

/**
 * Compare password with hash (constant-time)
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  const bcryptjs = (await import("bcryptjs")).default;
  return bcryptjs.compare(password, hash);
}

/**
 * Generate random secure token (for session tokens)
 */
export function generateRandomToken(length: number = 48): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Timing-safe string comparison - prevents timing attacks
 */
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate request signature for API authentication
 */
export function generateRequestSignature(
  method: string,
  path: string,
  timestamp: string,
  body: string
): string {
  const payload = `${method}:${path}:${timestamp}:${body}`;
  return crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("hex");
}

/**
 * Sanitize user input - prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .trim()
    .slice(0, 500); // Max 500 chars
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const realIP = headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIP || "unknown";
}

/**
 * Security headers for API responses
 */
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
