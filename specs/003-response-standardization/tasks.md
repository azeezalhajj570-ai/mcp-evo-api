---

description: "Task list for Phase 3.1 — Response Standardization migration"

---

# Tasks: Response Standardization

**Input**: Plan from `specs/003-response-standardization/plan.md`

**Prerequisites**: `src/types/response.ts` and `src/utils/response.ts` already exist. Tools are partially migrated (use `mcpText(success(...))` pattern but with inconsistent tool names, error codes, and missing `details`).

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

---

## Phase 1: Foundation Audit (Shared Infrastructure)

**Purpose**: Verify the contract infrastructure is complete and correct

- [ ] T001 [P] Audit `src/types/response.ts` — verify `SuccessResponse<T>`, `ErrorResponse`, `MCPResponse<T>`, `ErrorCodes` cover all required error scenarios (add `NOT_FOUND`, `DUPLICATE_ENTRY` if missing)
- [ ] T002 [P] Audit `src/utils/response.ts` — verify `success()`, `error()`, `mcpText()`, `mcpError()` signatures match `src/types/response.ts` and work correctly for all edge cases
- [ ] T003 Audit `src/index.ts` `getApiStatus` tool — ensure it uses `mcpText(success(...))` pattern with correct tool name and error handling

**Checkpoint**: Foundation confirmed — all 7 tool files can be migrated in parallel

---

## Phase 2: Tool Migration — `instances.ts`

**Goal**: Migrate all 7 tools in `src/tools/instances.ts` to consistent response contract

- [ ] T004 [P] Migrate `instances.list` — replace `TOOL` constant with `"instances.list"`, add error `details`, audit error code
- [ ] T005 [P] Migrate `instances.status` — replace `TOOL` with `"instances.status"`, add error `details`, audit error code
- [ ] T006 [P] Migrate `instances.restart` — replace `TOOL` with `"instances.restart"`, add error `details`
- [ ] T007 [P] Migrate `instances.logout` — replace `TOOL` with `"instances.logout"`, add error `details`
- [ ] T008 [P] Migrate `instances.presence` — replace `TOOL` with `"instances.presence"`, add error `details`
- [ ] T009 [P] Migrate `instances.create` — replace `TOOL` with `"instances.create"`, add error `details`
- [ ] T010 [P] Migrate `instances.delete` — replace `TOOL` with `"instances.delete"`, add error `details`

**Checkpoint**: All `instances.ts` tools emit identical response structures

---

## Phase 3: Tool Migration — `messages.ts`

**Goal**: Migrate all 14 tools in `src/tools/messages.ts`

- [ ] T011 [P] Migrate `messages.send_text` — literal tool name, error `details`, audit error code
- [ ] T012 [P] Migrate `messages.send_image` — literal tool name, error `details`, audit error code
- [ ] T013 [P] Migrate `messages.send_document` — literal tool name, error `details`, audit error code
- [ ] T014 [P] Migrate `messages.send_audio` — literal tool name, error `details`, audit error code
- [ ] T015 [P] Migrate `messages.send_sticker` — literal tool name, error `details`, audit error code
- [ ] T016 [P] Migrate `messages.send_location` — literal tool name, error `details`, audit error code
- [ ] T017 [P] Migrate `messages.send_contact` — literal tool name, error `details`, audit error code
- [ ] T018 [P] Migrate `messages.send_poll` — literal tool name, error `details`, audit error code
- [ ] T019 [P] Migrate `messages.send_reaction` — literal tool name, error `details`, audit error code
- [ ] T020 [P] Migrate `messages.send_status` — literal tool name, error `details`, audit error code
- [ ] T021 [P] Migrate `messages.send_template` — literal tool name, error `details`, audit error code
- [ ] T022 [P] Migrate `messages.send_list` — literal tool name, error `details`, audit parse error code separately
- [ ] T023 [P] Migrate `messages.update` — literal tool name, error `details`, audit error code
- [ ] T024 [P] Migrate `messages.search` — literal tool name, error `details`, audit error code

**Checkpoint**: All `messages.ts` tools emit identical response structures

---

## Phase 4: Tool Migration — `chats.ts`

**Goal**: Migrate all 5 tools in `src/tools/chats.ts`

- [ ] T025 [P] Migrate `chats.archive` — literal tool name, error `details`
- [ ] T026 [P] Migrate `chats.unarchive` — literal tool name, error `details`
- [ ] T027 [P] Migrate `chats.mark_read` — literal tool name, error `details`
- [ ] T028 [P] Migrate `chats.check_number` — literal tool name, error `details`
- [ ] T029 [P] Migrate `chats.delete_message` — literal tool name, error `details`
- [ ] T030 [P] Migrate `chats.business_profile` — literal tool name, error `details`

**Checkpoint**: All `chats.ts` tools emit identical response structures

---

## Phase 5: Tool Migration — `groups.ts`

**Goal**: Migrate all 11 tools in `src/tools/groups.ts`

- [ ] T031 [P] Migrate `groups.create` — literal tool name, error `details`
- [ ] T032 [P] Migrate `groups.add_members` — literal tool name, error `details`
- [ ] T033 [P] Migrate `groups.remove_members` — literal tool name, error `details`
- [ ] T034 [P] Migrate `groups.update_subject` — literal tool name, error `details`
- [ ] T035 [P] Migrate `groups.update_description` — literal tool name, error `details`
- [ ] T036 [P] Migrate `groups.update_picture` — literal tool name, error `details`
- [ ] T037 [P] Migrate `groups.invite` — literal tool name, error `details`
- [ ] T038 [P] Migrate `groups.revoke_invite` — literal tool name, error `details`
- [ ] T039 [P] Migrate `groups.leave` — literal tool name, error `details`
- [ ] T040 [P] Migrate `groups.members` — literal tool name, error `details`
- [ ] T041 [P] Migrate `groups.toggle_ephemeral` — literal tool name, error `details`

**Checkpoint**: All `groups.ts` tools emit identical response structures

---

## Phase 6: Tool Migration — `profile.ts`

**Goal**: Migrate all 4 tools in `src/tools/profile.ts`

- [ ] T042 [P] Migrate `profile.update_name` — literal tool name, error `details`
- [ ] T043 [P] Migrate `profile.update_status` — literal tool name, error `details`
- [ ] T044 [P] Migrate `profile.update_picture` — literal tool name, error `details`
- [ ] T045 [P] Migrate `profile.remove_picture` — literal tool name, error `details`
- [ ] T046 [P] Migrate `profile.update_privacy` — literal tool name, error `details`
- [ ] T047 [P] Migrate `profile.info` — literal tool name, error `details`

**Checkpoint**: All `profile.ts` tools emit identical response structures

---

## Phase 7: Tool Migration — `integrations.ts`

**Goal**: Migrate all 6 tools in `src/tools/integrations.ts`

- [ ] T048 [P] Migrate `chatwoot.configure` — literal tool name, error `details`
- [ ] T049 [P] Migrate `chatwoot.find` — literal tool name, error `details`
- [ ] T050 [P] Migrate `typebot.configure` — literal tool name, error `details`
- [ ] T051 [P] Migrate `typebot.start` — literal tool name, error `details`
- [ ] T052 [P] Migrate `typebot.status` — literal tool name, error `details`
- [ ] T053 [P] Migrate `typebot.find` — literal tool name, error `details`

**Checkpoint**: All `integrations.ts` tools emit identical response structures

---

## Phase 8: Tool Migration — `webhooks.ts`

**Goal**: Migrate both tools in `src/tools/webhooks.ts`

- [ ] T054 [P] Migrate `webhooks.set` — literal tool name, error `details`
- [ ] T055 [P] Migrate `webhooks.get` — literal tool name, error `details`

**Checkpoint**: All `webhooks.ts` tools emit identical response structures

---

## Phase 9: General Tool — `index.ts`

- [ ] T056 Migrate `getApiStatus` in `src/index.ts` — literal tool name, error `details`

---

## Phase 10: Polish & Cross-Cutting

- [ ] T057 Rebuild and run `npm run build` to verify TypeScript compilation
- [ ] T058 Run test suite (`npm test`) — verify no regressions
- [ ] T059 Clean up any remaining `TOOL` constants that are no longer used

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundation Audit (Phase 1)**: No dependencies — can start immediately
- **Tool Migrations (Phases 2-9)**: All depend on Foundation Audit completion
  - All 7 tool files can be migrated in **parallel**
  - Within each file, individual tool blocks can be edited in **parallel**
- **Polish (Phase 10)**: Depends on all tool migrations complete

### Parallel Opportunities

- T001 and T002 are independent (types vs utils audit)
- All tool migrations (T004-T056) can run in parallel across files since each file is independent
- Within a file, individual tool blocks are independent (different `server.tool(...)` calls)

## Implementation Strategy

1. Complete Phase 1: Foundation audit
2. Launch all tool files in parallel (Phases 2-9 can be split across 7 subtasks)
3. Run Phase 10: build + test
4. Migration complete — middleware (Phase 3.2+) is now plug-and-play
