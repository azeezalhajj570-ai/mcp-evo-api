import { Middleware } from "../types/context.js";

export const response: Middleware = async (ctx, next) => {
  const result = await next();
  if (result && typeof result === "object") {
    if (result.metadata) {
      result.metadata.durationMs = Date.now() - (ctx.startTime || Date.now());
      if (ctx.requestId) result.metadata.requestId = ctx.requestId;
    }
  }
  return result;
};
