import "server-only";

const MAX_KEYS = 10_000;

type Window = { count: number; resetAt: number };

// Fixed-window counter held in this server instance's memory. It is per instance, so it is a
// first line of defence, not a global quota; upstream limits still apply.
export function createRateLimiter(limit: number, windowMs: number) {
  const windows = new Map<string, Window>();

  function prune(now: number) {
    for (const [key, entry] of windows) if (entry.resetAt <= now) windows.delete(key);
    while (windows.size >= MAX_KEYS) windows.delete(windows.keys().next().value!);
  }

  return function consume(key: string) {
    const now = Date.now();
    const current = windows.get(key);
    if (!current || current.resetAt <= now) {
      if (windows.size >= MAX_KEYS) prune(now);
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    current.count += 1;
    return {
      allowed: current.count <= limit,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  };
}
