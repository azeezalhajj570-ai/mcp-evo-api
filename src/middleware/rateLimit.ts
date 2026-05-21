import { Middleware } from "../types/context.js";
import { ErrorCodes } from "../types/response.js";
import { error } from "../utils/response.js";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();
const CLEANUP_INTERVAL = 60_000;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

setInterval(cleanup, CLEANUP_INTERVAL);

export function rateLimit(options?: { maxRequests?: number; windowMs?: number }): Middleware {
  const max = options?.maxRequests ?? MAX_REQUESTS;
  const window = options?.windowMs ?? WINDOW_MS;

  return async (ctx, next) => {
    const key = ctx.userId || "anonymous";
    const now = Date.now();
    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + window };
      store.set(key, entry);
    }

    entry.count++;

    if (entry.count > max) {
      return error(ctx.tool, ErrorCodes.RATE_LIMIT_EXCEEDED, "Rate limit exceeded", true);
    }

    return next();
  };
}
