/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * NOTE: this only works correctly on a single long-lived server instance.
 * On Vercel's serverless/edge functions each invocation may run in a fresh
 * process, so this in-memory limiter must be swapped for a durable store
 * (e.g. Upstash Redis rate limiting) before relying on it in staging/prod.
 * It is enough to blunt naive abuse locally and unblock development now.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { success: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0 };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}

export function getClientKey(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}
