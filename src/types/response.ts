export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  metadata: {
    requestId: string;
    timestamp: string;
    durationMs?: number;
    tool: string;
    version: string;
  };
}

export interface ErrorResponse {
  success: false;
  code: string;
  message: string;
  retryable: boolean;
  details?: unknown;
  metadata: {
    requestId: string;
    timestamp: string;
    tool: string;
    version: string;
  };
}

export type MCPResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export const ErrorCodes = {
  INVALID_INPUT: "INVALID_INPUT",
  INSTANCE_NOT_FOUND: "INSTANCE_NOT_FOUND",
  AUTH_REQUIRED: "AUTH_REQUIRED",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  UNSUPPORTED_FEATURE: "UNSUPPORTED_FEATURE",
  EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR"
} as const;
