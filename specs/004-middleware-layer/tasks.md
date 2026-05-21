---

description: "Task list for Phase 3.2 — Middleware Layer implementation"

---

# Tasks: Middleware Layer

**Input**: Plan from `specs/004-middleware-layer/plan.md`

**Prerequisites**: Phase 3.1 complete (`src/types/response.ts`, `src/utils/response.ts` exist; all tools use `mcpText(success(...))` / `mcpText(error(...))`).

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

---

## Phase 1: Types + Core Infrastructure

**Purpose**: Shared types and composition utility that all middleware depends on

- [ ] T001 Create `src/types/context.ts` — define `RequestContext` interface (`requestId`, `tool`, `startTime`, `userId?`, `instanceId?`, `sessionId?`)
- [ ] T002 Create `src/middleware/compose.ts` — generic middleware composition function (koa-style `async (ctx, next) =>` with `dispatch` runner)

**Checkpoint**: Core infrastructure ready — all middleware can be built in parallel

---

## Phase 2: Individual Middleware (Parallel)

**Purpose**: Build each middleware layer independently

- [ ] T003 [P] Create `src/middleware/requestContext.ts` — generate `crypto.randomUUID()` as `requestId`, set `startTime` to `Date.now()`, attach to `ctx`
- [ ] T004 [P] Create `src/middleware/logging.ts` — log tool name, duration, success/failure as structured JSON via `console.log` / `console.error`
- [ ] T005 [P] Create `src/middleware/rateLimit.ts` — in-memory `Map<string, {count: number, resetAt: number}>`, 100 requests/minute per key, return `RATE_LIMIT_EXCEEDED` error when exceeded
- [ ] T006 [P] Create `src/middleware/auth.ts` — extract `Authorization: Bearer <token>` header, set `ctx.userId = "temp-user"` as stub; return `AUTH_REQUIRED` error if token missing
- [ ] T007 [P] Create `src/middleware/validation.ts` — accept `zod` schema, call `schema.parse(input)`, pass validated result through `ctx`, catch `ZodError` and return `INVALID_INPUT` error
- [ ] T008 [P] Create `src/middleware/response.ts` — wrap handler result in `mcpText(success(...))` / `mcpText(error(...))`, inject `requestId` and `durationMs` from `ctx`

**Checkpoint**: All 6 middleware modules built and independently testable

---

## Phase 3: Pipeline Integration

**Purpose**: Wire middleware into the tool registration entry point

- [ ] T009 Create `runWithMiddleware(tool, schema, handler)` in `src/middleware/compose.ts` (or a new entry point) — compose all 6 middleware layers in order, execute handler, return structured response
- [ ] T010 Test the composed pipeline end-to-end with a mock tool — verify each middleware fires in order, response shape matches `MCPResponse<T>`

**Checkpoint**: Pipeline runs and produces correct output for a single tool

---

## Phase 4: Tool Migration — `instances.ts`

- [ ] T011 Refactor `instances.list` — replace `start`/`try/catch`/`mcpText` boilerplate with `runWithMiddleware("instances.list", {}, handler)`, verify `TOOL` constant can be removed
- [ ] T012 [P] Refactor `instances.status`
- [ ] T013 [P] Refactor `instances.restart`
- [ ] T014 [P] Refactor `instances.logout`
- [ ] T015 [P] Refactor `instances.presence`
- [ ] T016 [P] Refactor `instances.create`
- [ ] T017 [P] Refactor `instances.delete`

---

## Phase 5: Tool Migration — `messages.ts`

- [ ] T018 [P] Refactor `messages.send_text`
- [ ] T019 [P] Refactor `messages.send_image`
- [ ] T020 [P] Refactor `messages.send_document`
- [ ] T021 [P] Refactor `messages.send_audio`
- [ ] T022 [P] Refactor `messages.send_sticker`
- [ ] T023 [P] Refactor `messages.send_location`
- [ ] T024 [P] Refactor `messages.send_contact`
- [ ] T025 [P] Refactor `messages.send_poll`
- [ ] T026 [P] Refactor `messages.send_reaction`
- [ ] T027 [P] Refactor `messages.send_status`
- [ ] T028 [P] Refactor `messages.send_template`
- [ ] T029 [P] Refactor `messages.send_list` — keep special `SyntaxError` handling for JSON parse
- [ ] T030 [P] Refactor `messages.update`
- [ ] T031 [P] Refactor `messages.search`

---

## Phase 6: Tool Migration — `chats.ts`

- [ ] T032 [P] Refactor `chats.archive`
- [ ] T033 [P] Refactor `chats.unarchive`
- [ ] T034 [P] Refactor `chats.mark_read`
- [ ] T035 [P] Refactor `chats.check_number`
- [ ] T036 [P] Refactor `chats.delete_message`
- [ ] T037 [P] Refactor `chats.business_profile`
- [ ] T038 Create `chats.history` — add `ChatHistorySchema` to `src/schemas/chats.ts`, add `getChatHistory` to service, register tool in `src/tools/chats.ts`, register `messages://history/{chatId}` resource, add to permission matrix

---

## Phase 7: Tool Migration — `groups.ts`

- [ ] T039 [P] Refactor `groups.create`
- [ ] T040 [P] Refactor `groups.add_members`
- [ ] T041 [P] Refactor `groups.remove_members`
- [ ] T042 [P] Refactor `groups.update_subject`
- [ ] T043 [P] Refactor `groups.update_description`
- [ ] T044 [P] Refactor `groups.update_picture`
- [ ] T045 [P] Refactor `groups.invite` — keep CSV-splitting logic
- [ ] T046 [P] Refactor `groups.revoke_invite`
- [ ] T047 [P] Refactor `groups.leave`
- [ ] T048 [P] Refactor `groups.members`
- [ ] T049 [P] Refactor `groups.toggle_ephemeral`

---

## Phase 8: Tool Migration — `profile.ts`

- [ ] T050 [P] Refactor `profile.update_name`
- [ ] T051 [P] Refactor `profile.update_status`
- [ ] T052 [P] Refactor `profile.update_picture`
- [ ] T053 [P] Refactor `profile.remove_picture`
- [ ] T054 [P] Refactor `profile.update_privacy`
- [ ] T055 [P] Refactor `profile.info`

---

## Phase 9: Tool Migration — `integrations.ts`

- [ ] T056 [P] Refactor `chatwoot.configure`
- [ ] T057 [P] Refactor `chatwoot.find`
- [ ] T058 [P] Refactor `typebot.configure`
- [ ] T059 [P] Refactor `typebot.start`
- [ ] T060 [P] Refactor `typebot.status`
- [ ] T061 [P] Refactor `typebot.find`

---

## Phase 10: Tool Migration — `webhooks.ts`

- [ ] T062 [P] Refactor `webhooks.set`
- [ ] T063 [P] Refactor `webhooks.get`

---

## Phase 11: General Tool — `index.ts`

- [ ] T064 Refactor `getApiStatus` in `src/index.ts`

---

## Phase 12: Build + Test

- [ ] T065 Remove unused imports (`success`, `error`, `ErrorCodes`) from tool files where no longer directly referenced
- [ ] T066 Run `npm run build` — verify TypeScript compilation
- [ ] T067 Run test suite (`npm test`) — verify no regressions
- [ ] T068 Remove any remaining `TOOL` constants and `start`/`try/catch`/`mcpText` boilerplate in all tool files

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Blocks |
|-------|-----------|--------|
| 1 — Types + Compose | Nothing | All middleware |
| 2 — Individual middleware | Phase 1 | Pipeline integration |
| 3 — Pipeline integration | Phase 2 | All tool migrations |
| 4-11 — Tool migrations | Phase 3 | Build + test |
| 12 — Build + test | Phases 4-11 | Ship |

### Parallel Opportunities

- All 6 middleware modules in Phase 2 can be built simultaneously (no interdependencies between layers)
- All tool migration tasks (Phases 4-11) can run in parallel across files once the pipeline is wired in Phase 3
- Within a tool file, individual tool blocks can be migrated in parallel

### Implementation Strategy

1. **Build infrastructure** (Phases 1-3): Get the pipeline working with one tool
2. **Verify output matches** existing `mcpText(success(...))` shape
3. **Bulk-migrate** all tool files in parallel (Phases 4-11)
4. **Clean up** unused imports and dead code (Phase 12)
5. After this phase: every new concern (JWT, RBAC, Redis rate limits, OpenTelemetry) is a new middleware layer — tool files never change.
