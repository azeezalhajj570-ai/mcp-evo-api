import crypto from "crypto";
import { Middleware } from "../types/context.js";

export const requestContext: Middleware = async (ctx, next) => {
  ctx.requestId = crypto.randomUUID();
  ctx.startTime = Date.now();
  return next();
};
