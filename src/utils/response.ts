import { ErrorResponse, SuccessResponse } from "../types/response.js";
import crypto from "crypto";

const VERSION = "2.0";

function requestId(): string {
  return crypto.randomUUID();
}

export function success<T = any>(tool: string, data: T, durationMs?: number): SuccessResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      requestId: requestId(),
      timestamp: new Date().toISOString(),
      durationMs,
      tool,
      version: VERSION
    }
  };
}

export function error(
  tool: string,
  code: string,
  message: string,
  retryable: boolean = false,
  details?: unknown
): ErrorResponse {
  return {
    success: false,
    code,
    message,
    retryable,
    details,
    metadata: {
      requestId: requestId(),
      timestamp: new Date().toISOString(),
      tool,
      version: VERSION
    }
  };
}

export function mcpText(response: any): { content: { type: "text"; text: string }[] } {
  if (!response || response.success === false) {
    const err = response as ErrorResponse;
    return {
      content: [{ type: "text", text: `Error [${err.code}]: ${err.message}` }]
    };
  }
  const data = (response as SuccessResponse).data;
  return {
    content: [{ type: "text", text: JSON.stringify(data ?? response) }]
  };
}

export function mcpError(error: unknown): { content: { type: "text"; text: string }[] } {
  const msg = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text", text: `Error: ${msg}` }]
  };
}
