import { compose } from "./compose.js";
import { requestContext } from "./requestContext.js";
import { logging } from "./logging.js";
import { rateLimit } from "./rateLimit.js";
import { auth } from "./auth.js";
import { response as responseMiddleware } from "./response.js";
import { Middleware, RequestContext } from "../types/context.js";
import { mcpText, error } from "../utils/response.js";
import { ErrorCodes } from "../types/response.js";

const defaultPipeline = compose([
  requestContext,
  logging,
  rateLimit(),
  auth,
  responseMiddleware
]);

export function createHandler(toolName: string, fn: (ctx: RequestContext) => Promise<any>, extraMiddleware?: Middleware[]) {
  const pipeline = extraMiddleware?.length
    ? compose([requestContext, logging, rateLimit(), auth, ...extraMiddleware, responseMiddleware])
    : defaultPipeline;

  return async (input: any) => {
    const ctx: RequestContext = { tool: toolName, input };
    try {
      const result = await pipeline(ctx, () => fn(ctx));
      return mcpText(result);
    } catch (e) {
      return mcpText(error(toolName, ErrorCodes.INTERNAL_ERROR, (e as Error).message));
    }
  };
}
