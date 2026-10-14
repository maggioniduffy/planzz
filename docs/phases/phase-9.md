# Phase 9 — AI chat (BYOK)

**Goal:** a chat dock where the user's own Anthropic key talks to the model directly from the browser, with read tools over their data and write tools that run only after Accept; threads saved per account. No CSP (README §4.10).

**Branch:** `phase-9-ai-chat` · **Read first:** CLAUDE.md · plan §Features (AI chat), §Key flows (AI chat), §Risks (BYOK key, AI writes) · README §4.10, §4.22 · research-notes queue for Phase 9.

## Verify first (researcher)

- `@anthropic-ai/sdk` current version: `dangerouslyAllowBrowser`, streaming with tool use (`messages.stream`, tool_use / tool_result blocks), error classes for 401/429/529, the browser access header.
- Current model ids (Haiku default, Sonnet option) and their tool-use support.

## Owner actions

O10 (a key for the manual check). e2e mocks Anthropic.

## Tasks

| # | Who | Task | Files | Acceptance |
| --- | --- | --- | --- | --- |
| 9.1 | I | Settings → AI: paste key, validate with a minimal request, store in `localStorage` or memory only ("Don't remember"), model picker, remove key | `src/lib/ai/key.ts`, `src/components/ai/key-settings.tsx` | key never in any request to the app's origin |
| 9.2 | I | `lib/ai/tools.ts`: zod schemas + executors for `list_tasks`, `get_task`, `search`, `create_task`, `update_task`, `create_note`, `list_routines`, `list_goals`, `get_calendar(range)`, all via supabase-js under RLS and the existing mutation functions (so caches, reminders and completed_at stay consistent); write tools flagged `requiresConfirm` | `src/lib/ai/tools.ts` | unit tests per tool with a fake client; invalid ids rejected by zod |
| 9.3 | I ∥ | `lib/ai/context.ts`: system prompt (role, today, timezone, confirm rule) + compact JSON (current view, axes/statuses/categories names and ids, ≤ 50 relevant task titles) + last 20 messages | `src/lib/ai/context.ts` | snapshot tests; token budget estimate |
| 9.4 | I | `lib/ai/client.ts`: streaming loop, read tools run immediately, write tools pause for confirmation, max 8 tool rounds per turn, errors (401 → "Key rejected, check Settings"; 429/529 → backoff then toast; offline → disabled input), abort | `src/lib/ai/client.ts` | unit tests with a scripted fake stream |
| 9.5 | I | `ChatDock` (⌘J, right dock; bottom sheet on mobile): message list with streaming markdown (sanitized), `ToolCard` for reads, `ConfirmCard` for writes ("Create 3 tasks in Study → Física II?" Accept / Reject), Undo toast after Accept, suggested prompts, thread switcher (per axis optional) | `src/components/ai/*` | — |
| 9.6 | I | Persistence: `ai_threads` / `ai_messages` CRUD (provider-neutral content blocks), titles from the first message | `src/lib/ai/threads.ts` | — |
| 9.7 | T | XSS sweep instead of a CSP (README §4.10): grep for `dangerouslySetInnerHTML` and unsanitized markdown/docx/AI rendering; e2e with a doc, task note and AI reply containing `<img src=x onerror=…>` and `<script>` → nothing executes in the app document; uploaded HTML still runs | `e2e/xss.spec.ts` | zero findings |
| 9.8 | T | e2e with mocked Anthropic (`page.route`): "Create 3 study tasks for Física II this week" → confirm card with 3 tasks → nothing written before Accept → Accept → 3 tasks in the matrix; network log: the key appears only in requests to `api.anthropic.com`; DB check: no column contains the key | `e2e/ai*.spec.ts`, `e2e/fakes/anthropic.ts` | green |
| 9.9 | O | Gate with a real key (O10); CHANGELOG | — | see Done when |

## Done when (plan)

- "Create 3 study tasks for Física II this week" proposes 3 tasks, creates them only after Accept, and they appear in the matrix.
- The key never appears in any network request to the app's own domain or in the database.

## Out of scope

Other providers, AI daily planning, embeddings (v2).
