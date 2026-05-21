# Implementation Plan: Middleware Layer

**Branch**: `004-middleware-layer` | **Date**: 2026-05-21 | **Spec**: `specs/evolution-mcp-v2.md`

**Input**: Phase 3.2 spec — centralized middleware pipeline for logging, rate limiting, auth, validation, and response formatting.

**Prerequisites**: Phase 3.1 (Response Standardization) complete. All tools return `mcpText(success(...))` / `mcpText(error(...))`.

## Summary

Create a composable middleware pipeline that wraps every MCP tool invocation. Extract cross-cutting concerns (logging, rate limiting, auth, validation, response wrapping) from tool handlers into reusable middleware layers. This enables the future Phase 4 additions (JWT, RBAC, Redis rate limits, OpenTelemetry) to slot in without touching tool code.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22+

**Primary Dependencies**: `@modelcontextprotocol/sdk`, `zod`, `crypto` (built-in)

**Storage**: In-memory `Map` for rate limiting (Redis in Phase 4)

**Testing**: `mocha` — unit tests per middleware + integration test through pipeline

**Target Platform**: Linux server, MCP stdio/SSE transport

**Project Type**: MCP server (TypeScript)

**Performance Goals**: Middleware overhead <50µs per layer, <1ms total pipeline overhead

**Constraints**: Zero breaking changes to tool names, schemas, or response shapes. Middleware must be individually testable and composable.

**Scale/Scope**: 5 middleware layers + 1 compose utility + context type. 40+ tools consume the pipeline.

## Constitution Check

*GATE: Must pass before implementation.*

- **No behavior change**: Middleware must not alter tool output shape or error semantics. Initial pass is transparent.
- **Incremental complexity**: Rate limit starts in-memory. Auth starts as stub. Logging starts with `console`. Future replacements must be drop-in.
- **Testability**: Each middleware must be independently unit-testable. Composed pipeline must be integration-testable.

## Project Structure

### Documentation (this feature)

```text
specs/004-middleware-layer/
├── plan.md              # This file
└── tasks.md             # Task breakdown
```

### Source Code (files added/modified)

```text
src/
├── types/
│   └── context.ts        # ADD — RequestContext interface
├── middleware/
│   ├── compose.ts        # ADD — generic middleware composition
│   ├── requestContext.ts # ADD — generate requestId, track timing
│   ├── logging.ts        # ADD — log tool execution + timing
│   ├── rateLimit.ts      # ADD — in-memory rate limiting
│   ├── auth.ts           # ADD — bearer token stub (Phase 4 = JWT)
│   ├── validation.ts     # ADD — zod schema validation centralization
│   └── response.ts       # ADD — inject metadata, format output
├── index.ts              # MODIFY — wire middleware into tool registration
├── tools/
│   ├── instances.ts      # MODIFY — remove duplicate logic, use pipeline
│   ├── messages.ts       # MODIFY — same
│   ├── chats.ts          # MODIFY — same
│   ├── groups.ts         # MODIFY — same
│   ├── profile.ts        # MODIFY — same
│   ├── integrations.ts   # MODIFY — same
│   └── webhooks.ts       # MODIFY — same
```

## Middleware Pipeline

```text
Request
   ↓
RequestContextMiddleware  — generate requestId, set startTime
   ↓
LoggingMiddleware         — log tool name, duration, success/fail
   ↓
RateLimitMiddleware       — check per-user rate (Map, 100/min)
   ↓
AuthenticationMiddleware  — extract Bearer token, set userId (stub)
   ↓
ValidationMiddleware      — zod schema.parse(input)
   ↓
ToolExecution            — original service call
   ↓
ResponseMiddleware        — inject metadata, wrap in mcpText
   ↓
Structured Response
```

### Layer Details

| Layer | Responsibility | Phase 3.2 Impl | Phase 4 Replacement |
|-------|---------------|----------------|---------------------|
| requestContext | UUID + timing | `crypto.randomUUID()` + `Date.now()` | Same |
| logging | Console structured log | `console.log` / `console.error` | pino → OpenTelemetry |
| rateLimit | Per-user token bucket | `Map<string,{count,reset}>` | Redis + sliding window |
| auth | Extract identity | Bearer header → `ctx.userId` | JWT verify + RBAC |
| validation | Input validation | `schema.parse(input)` | Same |
| response | Inject metadata | Patch durationMs, wrap in mcpText | Same |

## Migration Pattern

### Current tool pattern

```typescript
server.tool("instances.list", {}, async () => {
  const start = Date.now();
  try {
    const svc = getService();
    const instances = await svc.fetchInstances();
    return mcpText(success("instances.list", instances, Date.now() - start));
  } catch (e) {
    return mcpText(error("instances.list", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
  }
});
```

### Target tool pattern

```typescript
server.tool("instances.list", {}, async () => {
  return runWithMiddleware("instances.list", {}, () => {
    const svc = getService();
    return svc.fetchInstances();
  });
});
```

Where `runWithMiddleware` composes the pipeline, handles success/error wrapping, and delegates to middleware which each call `next()`.

### What gets removed from tools

| Duplicate Code | Now Handled By |
|----------------|---------------|
| `const start = Date.now()` | `requestContext` middleware |
| `try/catch` with success/error | `response` middleware + pipeline error handler |
| `mcpText(success(...))` | `response` middleware |
| `mcpText(error(...))` | `response` middleware |
| Error code selection | Optional: `validation` middleware or pipeline catch |

### What stays in tools

- Service method call (`svc.fetchInstances()`)
- Any domain-specific error mapping
- Input reshaping (e.g., CSV splitting in `groups.invite`)
- New tool handlers (e.g., `chats.history` added during this phase)

## Complexity Tracking

N/A — no constitution violations. This is a horizontal layer addition with zero behavior change to tool outputs.
