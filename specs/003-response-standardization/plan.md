# Implementation Plan: Response Standardization

**Branch**: `003-response-standardization` | **Date**: 2026-05-21 | **Spec**: `specs/evolution-mcp-v2.md`

**Input**: User specification for Phase 3.1 — standardize all MCP tool responses to a uniform contract.

**Note**: Types (`src/types/response.ts`) and helpers (`src/utils/response.ts`) already exist from Phase 2. This plan completes the migration and prepares for middleware (Phase 3.2+).

## Summary

Migrate all 40+ MCP tools to emit identical `SuccessResponse<T>` / `ErrorResponse` structures. Audit error code usage across all tools, add granular error codes per domain, wire durationMs consistently, and ensure metadata is uniform. This enables plug-and-play middleware for logging, rate limiting, auth, and observability in subsequent phases.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22+

**Primary Dependencies**: `@modelcontextprotocol/sdk`, `zod`, `crypto` (built-in)

**Storage**: N/A (stateless tool layer)

**Testing**: `mocha` (configured via `.mocharc.yml`)

**Target Platform**: Linux server, MCP stdio/SSE transport

**Project Type**: MCP server (TypeScript CLI + HTTP)

**Performance Goals**: Tool latency <500ms p95, consistent metadata overhead <1ms

**Constraints**: All tools must maintain backward compatibility. No breaking changes to existing tool names or input schemas.

**Scale/Scope**: 40+ tools across 7 domain files + 1 general tool in `index.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Consistency**: Every tool must return the same response shape. No raw returns, no ad-hoc error shapes.
- **Error granularity**: Tools must use domain-specific error codes, not blanket `EXTERNAL_API_ERROR`.
- **No regressions**: All existing tool names, schemas, and service integrations remain unchanged.
- **Middleware readiness**: Tools should return `MCPResponse<T>` so middleware can wrap in `mcpText()` centrally.

## Project Structure

### Documentation (this feature)

```text
specs/003-response-standardization/
├── plan.md              # This file
└── tasks.md             # Task breakdown
```

### Source Code (files modified)

```text
src/
├── types/response.ts     # Already exists — verify completeness
├── utils/response.ts     # Already exists — verify completeness
├── index.ts              # Migrate general tool (getApiStatus)
├── tools/
│   ├── instances.ts      # Audit error codes, verify pattern
│   ├── messages.ts       # Audit error codes, verify pattern
│   ├── chats.ts          # Audit error codes, verify pattern
│   ├── groups.ts         # Audit error codes, verify pattern
│   ├── profile.ts        # Audit error codes, verify pattern
│   ├── integrations.ts   # Audit error codes, verify pattern
│   └── webhooks.ts       # Audit error codes, verify pattern
└── middleware/           # Future — not yet created
```

## Complexity Tracking

N/A — no constitution violations. This is a pattern migration, not an architecture change.

## Migration Pattern

### Current (all tools)

```typescript
server.tool("instances.list", {}, async () => {
  const start = Date.now();
  try {
    const svc = getService();
    const instances = await svc.fetchInstances();
    return mcpText(success(TOOL, instances, Date.now() - start));
  } catch (e) {
    return mcpText(error(TOOL, ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
  }
});
```

### Target

```typescript
server.tool("instances.list", {}, async () => {
  const start = Date.now();
  try {
    const svc = getService();
    const instances = await svc.fetchInstances();
    return mcpText(success("instances.list", instances, Date.now() - start));
  } catch (e) {
    const err = e as Error;
    return mcpText(error("instances.list", ErrorCodes.EXTERNAL_API_ERROR, err.message, true, { cause: err.cause }));
  }
});
```

### Key changes per tool

| Change | Detail |
|--------|--------|
| Use literal tool name string | Replace `TOOL` constant with exact tool name (e.g. `"instances.list"`) so each tool has unique metadata |
| Add `details` to errors | Pass error cause or context object as 5th arg to `error()` |
| Audit error codes | Replace blanket `EXTERNAL_API_ERROR` with domain-specific codes where applicable |
| Verify return shape | Ensure every tool returns `mcpText(success(...))` or `mcpText(error(...))` — no raw returns |
