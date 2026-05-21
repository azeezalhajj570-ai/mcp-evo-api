import { Middleware } from "../types/context.js";

export const logging: Middleware = async (ctx, next) => {
  const result = await next();
  const duration = Date.now() - (ctx.startTime || Date.now());
  const ok = result?.success !== false;
  if (ok) {
    console.log(`[${ctx.requestId}] ${ctx.tool} → OK (${duration}ms)`);
  } else {
    console.error(`[${ctx.requestId}] ${ctx.tool} → FAIL [${result?.code}] ${result?.message} (${duration}ms)`);
  }
  return result;
};
