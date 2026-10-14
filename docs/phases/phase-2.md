# Phase 2 — App shell and main matrix (read)

**Goal:** a signed-in user lands on the Board: sidebar, toolbar, right dock, and the main matrix rendering their tasks with pan, three semantic zoom levels, sticky headers, collapsible rows and per-column category filters in the URL. Read-only (moves and edits are Phase 3).

**Branch:** `phase-2-board-read` · **Read first:** CLAUDE.md · plan §Core concepts (Main matrix), §Features (Layout, Board — the restricted canvas), §Visual language (Matrix look), §Key flows (Pan and zoom on the board), §Architecture (Where code runs, Routes) · README §4.11, §4.18 · research-notes "TanStack Query / Zustand", "Next.js 16".

**Source to port:** Things `src/components/providers/query-provider.tsx`, `src/lib/query-client.ts`, `src/stores/ui-store.ts` (pattern), `src/components/app-shell/*`, `src/components/sidebar/*` (layout and nav item), `src/components/board/toolbar.tsx`.

## Verify first (researcher)

- `position: sticky` for both top (column headers) and left (row headers) inside one 2D `overflow: auto` container, including the top-left corner cell; Safari quirks.
- Trackpad pinch arrives as `wheel` with `ctrlKey` in Chrome, Safari and Firefox on macOS; Safari `gesturestart`/`gesturechange` need.
- `ResizeObserver`-free way to compute "densest level that fits" (container size vs. column count × width).

## Decisions

- Filter URL: `?cat.<axisId>=<categoryId|none>,…` (README §4.11). Parsing/serializing lives in `lib/matrix/filters.ts` (pure).
- The board query loads all open tasks (not deleted, not archived) for the user in one request; Done rows load too but render collapsed. No pagination in v1 (auto-archive bounds Done). Revisit at the Phase 10 500-task trace.

## Tasks

| # | Who | Task | Files | Acceptance |
| --- | --- | --- | --- | --- |
| 2.1 | I | Data layer: `QueryProvider`, `query-client.ts` (port), query option factories taking the Supabase client: `structureQuery` (axes, statuses, categories ordered by position), `boardTasksQuery` (explicit column list, no `search`), `countsQuery` (`matrix_counts`). Server prefetch in `app/app/layout.tsx`/`page.tsx` + `HydrationBoundary` | `src/components/providers/*`, `src/lib/query-client.ts`, `src/lib/tasks/queries.ts`, `src/lib/structure/queries.ts` | unit tests on query builders; no client waterfall on first load |
| 2.2 | I | UI store (Zustand): zoom level, collapsed rows (Done collapsed by default), dock state (`null` / `task` / `ai`), focus (cell / card), selection set, drag state; persisted slice (zoom, collapsed rows) with `skipHydration` | `src/stores/ui-store.ts` | unit tests |
| 2.3 | I | `lib/matrix/filters.ts` (parse/serialize category filters, unknown ids dropped) and `lib/matrix/zoom.ts` (levels table, `fitLevel(viewport, columns)`, `anchorScroll(prevLevel, nextLevel, pointer, scroll)` keeping the pointed cell under the pointer) — pure | `src/lib/matrix/{filters,zoom}.ts` | unit tests incl. round-trip and anchor math |
| 2.4 | I | App shell: `app/app/layout.tsx` with sidebar (240 px, collapsible: wordmark, Board, Today, Calendar, Axes with color dot, emoji and open-task count, Routines, Settings; GuestBanner footer), toolbar (search placeholder, filter chips placeholder, zoom `SegmentedControl`, "+ Task" disabled until Phase 3, AI toggle disabled until Phase 9), right dock (400 px, resizable, empty states), mobile: sidebar and dock as sheets. Stub pages for every `/app` route in the plan so navigation works | `src/app/app/**`, `src/components/{app-shell,sidebar,toolbar,dock}/*` | Playwright: navigating between routes keeps the shell mounted |
| 2.5 | I | Matrix: `MatrixViewport` (overflow auto, bounds = edges + 48 px, drag-to-pan on gutters and empty header space, space + drag, grab cursor), `Matrix` (CSS grid driven by `--col-w` and density vars), sticky `ColumnHeader` (dot, name, emoji, count, filter chips) and `RowHeader` (name, count, collapse toggle), `Cell` (glass panel, `--radius-cell`, 12 px gutters, hover aurora glow), Done row at 70% opacity, dot grid under the grain. Cell ids `main:<axisId>:<statusId>` | `src/components/matrix/*` | renders the seeded board; headers stay visible while panning |
| 2.6 | I | `TaskCard` at three densities (plan table): axis edge 2 px, title, category chip, due badge (overdue/today styling), priority dot, subtask progress; Detail adds 2 lines of notes, reminder bell, goal chip (bell and goal chip render only when data exists). Overview caps cells at 12 cards + "+N more" (expands the cell) | `src/components/task/task-card.tsx` | styleguide section shows all densities with real component |
| 2.7 | I | Zoom interactions: ⌘− / ⌘+ / Shift+1, toolbar control, pinch debounced into steps with `anchorScroll`; card size change animates with Motion `layout` (220 ms, off under reduced motion) | `src/components/matrix/matrix-viewport.tsx`, `src/hooks/use-zoom-shortcuts.ts` | — |
| 2.8 | I | Category filter chips per column: All · categories · Uncategorized; multi-select OR; filters only that column; synced to the URL with `router.replace(…, { scroll: false })`; filtered-out cards collapse and fade (250 ms) | `src/components/matrix/category-filter.tsx` | — |
| 2.9 | T | Seed script: 200 tasks across 3 axes, 4 statuses, 2–3 categories per axis, mixed due/priority/subtasks (`pnpm seed:board -- --user <email>`); e2e: no layout shift (CLS ≈ 0 via `PerformanceObserver`), zoom step keeps the pointed cell in place (bounding box before/after within 1 px), filtering one column leaves others untouched and survives reload | `scripts/seed-board.mjs`, `e2e/board-*.spec.ts` | `pnpm e2e` green |
| 2.10 | O | Gate + CHANGELOG | — | see Done when |

## Done when (plan)

- 200 seeded tasks render with no layout shift.
- Zoom steps keep the pointed cell in place.
- Filtering one column leaves others untouched and survives reload.

## Out of scope

DnD, task creation and editing, drawer contents, axis workspace.
