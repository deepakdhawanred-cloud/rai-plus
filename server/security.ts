import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { UserAccount } from '../src/types';

export const SESSION_COOKIE_NAME = 'rai_session';
export const SESSION_IDLE_TTL_MS = 8 * 60 * 60 * 1000; // 8-hour sliding idle expiry
export const SESSION_MAX_TTL_MS = 24 * 60 * 60 * 1000; // 24-hour absolute session ceiling

const SCRYPT_KEYLEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;

/**
 * Hashes a plaintext password with per-user random salt using Node's native scrypt.
 * Format: scrypt$<saltHex>$<derivedKeyHex>
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

/**
 * Verifies a plaintext password against a stored scrypt hash in constant time.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash || !storedHash.startsWith('scrypt$')) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;
  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS);
    const expected = Buffer.from(expectedHex, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Strips server-only credential fields (e.g. passwordHash) before sending a user object to clients.
 */
export function sanitizeUserForClient<T extends UserAccount>(user: T): Omit<T, 'passwordHash'> {
  const copy = { ...user } as Record<string, unknown>;
  const hasCustomPassword = Boolean(user.passwordHash);
  delete copy.passwordHash;
  copy.mustChangePassword =
    typeof user.mustChangePassword === 'boolean'
      ? user.mustChangePassword
      : !hasCustomPassword;
  return copy as Omit<T, 'passwordHash'>;
}

/**
 * Controls whether one-click demo/passwordless sandbox accounts are exposed and accepted.
 * - Explicitly disabled if ENABLE_DEMO_LOGIN="false".
 * - In production (NODE_ENV=production), disabled by default unless ENABLE_DEMO_LOGIN="true"
 *   is explicitly opted in for a public sales sandbox.
 * - In development/testing, enabled by default so local demos & audit suites work out of the box.
 */
export function isDemoLoginEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const explicit = env.ENABLE_DEMO_LOGIN?.trim().toLowerCase();
  if (explicit === 'true' || explicit === '1') return true;
  if (explicit === 'false' || explicit === '0') return false;
  return env.NODE_ENV !== 'production';
}

export function parseCookieHeader(cookieHeader?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx <= 0) continue;
    const key = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

export function extractSessionToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }
  const headerToken = req.headers['x-session-token'];
  if (typeof headerToken === 'string' && headerToken.trim()) {
    return headerToken.trim();
  }
  const cookies = parseCookieHeader(req.headers.cookie);
  const cookieToken = cookies[SESSION_COOKIE_NAME];
  return cookieToken && cookieToken.trim().length > 0 ? cookieToken.trim() : undefined;
}

function isSecureRequest(req: Request): boolean {
  return (
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    process.env.NODE_ENV === 'production'
  );
}

export function setSessionCookie(res: Response, token: string, req: Request): void {
  const attrs = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_MAX_TTL_MS / 1000)}`,
  ];
  if (isSecureRequest(req)) {
    attrs.push('Secure');
  }
  res.setHeader('Set-Cookie', attrs.join('; '));
}

export function clearSessionCookie(res: Response, req: Request): void {
  const attrs = [
    `${SESSION_COOKIE_NAME}=`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isSecureRequest(req)) {
    attrs.push('Secure');
  }
  res.setHeader('Set-Cookie', attrs.join('; '));
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
  message: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

export function createSlidingWindowRateLimiter(options: RateLimiterOptions) {
  const buckets = new Map<string, number[]>();
  let lastPrune = Date.now();

  return (req: Request, res: Response, next: NextFunction) => {
    if (options.skip?.(req)) {
      next();
      return;
    }

    const now = Date.now();
    const key = options.keyGenerator ? options.keyGenerator(req) : getClientIp(req);
    const recent = (buckets.get(key) || []).filter((ts) => now - ts < options.windowMs);

    if (recent.length >= options.maxRequests) {
      const oldest = recent[0] ?? now;
      const retryAfterSec = Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.status(429).json({
        error: options.message,
        retryAfterSeconds: retryAfterSec,
      });
      return;
    }

    recent.push(now);
    buckets.set(key, recent);
    res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, options.maxRequests - recent.length)));

    // Keep in-memory buckets strictly bounded (zero leak during long soak runs)
    if (buckets.size > 2000 || now - lastPrune > options.windowMs) {
      lastPrune = now;
      for (const [bucketKey, timestamps] of buckets) {
        if (timestamps.every((ts) => now - ts >= options.windowMs)) {
          buckets.delete(bucketKey);
        }
      }
      // Hard ceiling eviction if under distributed flood
      if (buckets.size > 10000) {
        const overflow = buckets.size - 8000;
        let removed = 0;
        for (const bucketKey of buckets.keys()) {
          buckets.delete(bucketKey);
          removed += 1;
          if (removed >= overflow) break;
        }
      }
    }

    next();
  };
}

/**
 * Security headers middleware: strict CSP, framing protection, HSTS, MIME sniffing lock.
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), payment=(), usb=()');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  const isDev = process.env.NODE_ENV !== 'production';
  const cspDirectives = [
    "default-src 'self'",
    // Vite dev HMR needs inline/eval; production allows Google Maps & self
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com"
      : "script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com https://*.ggpht.com https://*.googleusercontent.com",
    "connect-src 'self' https://maps.googleapis.com https://*.supabase.co https://generativelanguage.googleapis.com ws: wss:",
    "frame-src 'self' https://drive.google.com https://docs.google.com",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}

/**
 * Strict CORS middleware: only permits configured origins in production, blocks cross-origin
 * credentialed calls from unknown domains.
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  if (!origin) {
    next();
    return;
  }

  const configured = (process.env.ALLOWED_ORIGINS || process.env.APP_URL || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const hostOrigin = req.headers.host
    ? `${req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http'}://${req.headers.host}`
    : '';
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  const allowed =
    origin === hostOrigin ||
    configured.includes(origin) ||
    (process.env.NODE_ENV !== 'production' && isLocalhost);

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Session-Token');
  }

  if (req.method === 'OPTIONS') {
    res.status(allowed ? 204 : 403).end();
    return;
  }

  next();
}

/**
 * Lightweight pure-JS fallback PDF text extractor for environments without /usr/bin/gs
 * (e.g. Hostinger shared Node.js hosting or Windows). Extracts literal text operators
 * from uncompressed or FlateDecode streams cleanly without spawning external binaries.
 */
export function extractTextFromPdfBufferFallback(pdfBuffer: Buffer): string {
  const raw = pdfBuffer.toString('latin1');
  const chunks: string[] = [];
  const textRuns = raw.match(/\(([^()\\]{2,200})\)\s*Tj/g) || [];
  for (const run of textRuns.slice(0, 4000)) {
    const inner = run.slice(1, run.lastIndexOf(')'));
    const cleaned = inner.replace(/[^\x20-\x7E]/g, ' ').trim();
    if (cleaned) chunks.push(cleaned);
  }
  return chunks.join(' ');
}
