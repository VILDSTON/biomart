interface RateLimitRecord {
  timestamps: number[];
}

// Preserve across module reloads in the same Node.js / Lambda container
const globalRef = globalThis as unknown as { __biomart_rate_limit_store?: Map<string, RateLimitRecord> };
if (!globalRef.__biomart_rate_limit_store) {
  globalRef.__biomart_rate_limit_store = new Map<string, RateLimitRecord>();
}
const rateLimitStore = globalRef.__biomart_rate_limit_store;

// Clean stale entries periodically to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  const cleaner = setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 3600000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    });
  }, 300000);
  if (cleaner && typeof (cleaner as any).unref === 'function') {
    (cleaner as any).unref();
  }
}

/**
 * In-memory sliding-window rate limiter by identifier (e.g. IP address or store ID)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  let record = rateLimitStore.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps within the sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return { success: false, remaining: 0, resetMs };
  }

  record.timestamps.push(now);
  return {
    success: true,
    remaining: maxRequests - record.timestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(request: Request): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return '127.0.0.1';
}
