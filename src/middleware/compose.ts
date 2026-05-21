import { Middleware, RequestContext } from "../types/context.js";

export function compose(middlewares: Middleware[]) {
  return async (ctx: RequestContext, handler: (ctx: RequestContext) => Promise<any>): Promise<any> => {
    let index = -1;

    async function dispatch(i: number): Promise<any> {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;
      const middleware = middlewares[i];
      if (!middleware) return handler(ctx);
      return middleware(ctx, () => dispatch(i + 1));
    }

    return dispatch(0);
  };
}
