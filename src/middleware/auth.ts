import { Middleware } from "../types/context.js";
import { authStorage } from "../transports/sse.js";

export const auth: Middleware = async (ctx, next) => {
  const session = authStorage?.getStore() as { instanceName?: string } | undefined;
  const identity = session?.instanceName || ctx.userId || "anonymous";
  ctx.userId = identity;
  ctx.instanceId = identity;
  return next();
};
