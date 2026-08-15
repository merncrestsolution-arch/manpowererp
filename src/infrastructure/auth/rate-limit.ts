type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// In-memory rate limiting is acceptable for Phase 2; production should use Redis-backed limiting.
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  increment = true,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    if (increment) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    }
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  if (increment) {
    entry.count += 1;
    rateLimitStore.set(key, entry);
  }
  return { allowed: true, retryAfterMs: 0 };
}
