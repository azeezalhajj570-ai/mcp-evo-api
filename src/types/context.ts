import { MCPResponse } from "./response.js";

export interface RequestContext {
  requestId?: string;
  tool: string;
  startTime?: number;
  input?: any;
  userId?: string;
  instanceId?: string;
  sessionId?: string;
  error?: any;
}

export type Middleware = (ctx: RequestContext, next: () => Promise<any>) => Promise<MCPResponse | any>;
