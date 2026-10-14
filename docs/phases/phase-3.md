# Phase 3 — Tasks, DnD and structure editing

**Goal:** the board becomes usable: quick add, a full task drawer, drag and drop in and across cells (single, multi, keyboard, onto sidebar axes), done/archive/trash with undo, and a settings editor for axes, statuses and categories.

**Branch:** `phase-3-tasks-dnd` · **Read first:** CLAUDE.md · plan §Core concepts (Moves and what they change, Rules), §Features (Board quick actions, Task, Keyboard shortcuts), §Key flows (Moving tasks in a matrix) · README §4.4, §4.5, §4.16, §4.17 · research-notes "dnd-kit × Motion".

**Source to port:** Things `src/lib/order.ts`, `src/components/dnd/*` (collision, targets, provider), `src/components/board/sortable-items.tsx`, `src/lib/items/{mutations,batch-mutations,state-mutations,reorder,cache}.ts` (patterns), `src/components/drawer/*`, `src/components/sidebar/{sortable-rows,manage-rows,confirm-delete-dialog}.tsx`, `src/lib/cron/*`, `src/app/api/cron/daily/route.ts`.

## Verify first (researcher)

- dnd-kit auto-scroll when the scroll container is the board viewport (not the window), with sticky headers overlapping the droppable area.
- `chrono-node` current version, ESM import, parsing "tomorrow 18:00", "fri" with a reference date and timezone.
- Tiptap v3 + markdown: official `@tiptap/markdown` vs `tiptap-markdown`; round-trip fidelity for lists, checkboxes, code, links.

## Tasks

| # | Who | Task | Files | Acceptance |
| --- | --- | --- | --- | --- |
| 3.0 | I | **Spike** (dev-only `/styleguide/matrix-dnd`): 12 cells × 20 cards, multi-container sortable in the 2D viewport with sticky headers, auto-scroll, drag-to-pan on gutters, Things' Motion pattern. Opus records the pattern in research-notes | `src/app/styleguide/matrix-dnd/*` | drop lands in the right cell at every scroll position; pan never starts on a card |
| 3.1 | I | `lib/order.ts` (port) and `lib/matrix/move.ts`: from `{ source cell, target cell, neighbors, taskIds }` produce patches per the moves table (position via `generateKeyBetween`/`generateNKeysBetween`; status; axis + category null + goal null on cross-axis; category on inner moves; sidebar-axis drop). Hidden-sibling ordering rule (plan flow step 4). No `completed_at` (trigger does it, README §4.4) | `src/lib/order.ts`, `src/lib/matrix/move.ts` | exhaustive unit tests: every row of the moves table, multi-select, first/last/empty cell, filtered neighbors |
| 3.2 | I | Task mutations with optimistic cache + rollback + toast: create, update fields, move (single → one `update`; many → `move_tasks` RPC), mark done (first `is_done` status), archive, trash, restore, delete forever; Undo toast with inverse mutation queued after the original settles | `src/lib/tasks/mutations.ts`, `src/lib/tasks/cache.ts` | unit tests with delayed mocks; request count assertions |
| 3.3 | I ∥ | `lib/tasks/parse-quick-add.ts`: `#category` (matched within the target axis, case/accent-insensitive), `!high/!med/!low`, date phrase via chrono-node relative to now in the profile timezone → `due_date` + `due_time` | `src/lib/tasks/parse-quick-add.ts` | table-driven unit tests incl. Spanish accents in category names |
| 3.4 | I | Quick add: cell footer "+ Add" inline input (axis × status, + the single active category filter), `N` (focused cell else a quick-add dialog with axis/status pickers), toolbar "+ Task"; ⌘K opens a minimal palette with "New task" only (full palette Phase 10) | `src/components/task/quick-add.tsx`, `src/components/matrix/cell.tsx` | Playwright: add in a cell with "#Química !high fri" |
| 3.5 | I | DnD wiring on the main matrix: `BoardDndProvider`, sortable cells, `DragOverlay`, cell drag-over styling (150 ms), multi-select (⌘/Shift-click, Esc), drag onto sidebar axes (drop target styling), toast "Pick category" after cross-axis move, keyboard DnD (dnd-kit keyboard sensor) | `src/components/dnd/*`, `src/components/matrix/*`, `src/components/sidebar/*` | spike pattern followed; no Motion layout during drag |
| 3.6 | I | Keyboard model: focus between cells and cards (arrows, H J K L), Enter opens drawer, ⌘←/⌘→ status, ⌘↑/⌘↓ axis, X done, D due (opens date popover), ⌫ trash | `src/hooks/use-board-keys.ts` | one unit/e2e test per key |
| 3.7 | I | Task drawer (`?task=<id>`, linkable, in the right dock; bottom sheet on mobile): title, Tiptap markdown notes (1 s debounced save), axis/category/status pickers, priority, due date + time, time block, subtasks (add, check, reorder, delete). Goal, reminders and attachments sections render disabled with "Coming soon" until Phases 4/7 | `src/components/task/{task-drawer,subtask-list}.tsx`, `src/components/editor/*` | `?task=` survives reload; markdown round-trips |
| 3.8 | I ∥ | Card quick actions on hover (open, done, due, delete); Done check draw + desaturate (spring); `/app/trash` list with restore / delete forever; auto-archive hidden from board | `src/components/task/task-card.tsx`, `src/app/app/trash/page.tsx` | — |
| 3.9 | I | `/api/cron/daily` (README §4.16): `CRON_SECRET` bearer check, trash purge ≥ 30 days, auto-archive Done tasks older than `profiles.auto_archive_days`; `vercel.json` daily cron | `src/app/api/cron/daily/route.ts`, `src/lib/cron/*`, `vercel.json` | route tests: 401 without secret; only old rows affected |
| 3.10 | I | Settings editor (`/app/settings/structure`): axes (rename, emoji, color from aurora stops, reorder, add up to 8, delete with "move tasks to" picker or delete them), statuses (rename, reorder, `is_done` toggle, add up to 6, delete with reassignment, last non-done protected), categories per axis (CRUD, color, reorder, up to 20; delete → Uncategorized). DB limit errors map to friendly toasts | `src/app/app/settings/[[...section]]/page.tsx`, `src/components/settings/structure/*`, `src/lib/structure/mutations.ts` | Playwright: delete a status with tasks forces reassignment |
| 3.11 | T | Tests: request-count e2e (reorder = one `PATCH` on `tasks`; 5 selected = one `rpc/move_tasks`); cross-axis move nulls category; keyboard DnD; trash + undo; structure editor flows | `e2e/*`, `src/**/*.test.ts(x)` | green |
| 3.12 | O | Gate + CHANGELOG | — | see Done when |

## Done when (plan)

- Reorder persists with a single-row update.
- A cross-axis move nulls the category.
- Moving 5 selected tasks is one RPC call.
- Deleting a status forces reassignment.
- All `move.ts` cases are unit-tested.

## Out of scope

Inner matrix (Phase 4), reminders, goals, attachments, full command palette.
