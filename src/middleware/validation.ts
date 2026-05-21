import { z } from "zod";
import { Middleware } from "../types/context.js";
import { ErrorCodes } from "../types/response.js";
import { error } from "../utils/response.js";

export function validation(schema: z.ZodSchema): Middleware {
  return async (ctx, next) => {
    if (!schema) return next();
    try {
      ctx.input = schema.parse(ctx.input);
      return next();
    } catch (e) {
      if (e instanceof z.ZodError) {
        return error(ctx.tool, ErrorCodes.INVALID_INPUT, e.errors.map(e => e.message).join("; "));
      }
      throw e;
    }
  };
}
