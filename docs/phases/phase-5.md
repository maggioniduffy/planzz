# Phase 5 — Free canvas per axis

**Goal:** each axis has an infinite canvas with notes, text, images, link cards and live references to tasks and docs, persisted per node and per axis viewport.

**Branch:** `phase-5-canvas` · **Read first:** CLAUDE.md · plan §Features (Axis workspace → Canvas), §Data model (`canvas_nodes`, `save_canvas_layout`), §Motion (React Flow owns the canvas) · README §4.2, §4.18 · research-notes "Pinned versions" (@xyflow/react).

**Source to port:** Things `src/components/canvas/*`, `src/lib/canvas/{layout,save,viewport}.ts` (+ tests), the `save_canvas_layout` function in `supabase/migrations/20260101000400_functions.sql`, `e2e/canvas*.spec.ts`.

## Verify first (researcher)

- Diff Things' canvas (nodes = items with stored positions) against Planzz's `canvas_nodes` model: list every function that must change and every one that ports unchanged.
- React Flow 12: `onlyRenderVisibleElements`, `NodeResizer`, z-order via `zIndex`, viewport events — any change since Things' version pin.

## Tasks

| # | Who | Task | Files | Acceptance |
| --- | --- | --- | --- | --- |
| 5.1 | I | Migration: `save_canvas_layout(axis_id, layout jsonb)` for `canvas_nodes` (batch upsert x/y/w/h/z, security invoker, `search_path = ''`) and `save_canvas_viewport(axis_id, viewport)` → `axes.canvas_viewport`; pgTAP for both incl. other user's axis | `supabase/migrations/*_canvas.sql`, `supabase/tests/database/*canvas*.sql` | `supabase test db` green |
| 5.2 | I | Port `CanvasView` to the Canvas tab: dot grid background, controls, minimap toggle, snap 8 px, multi-select, pan/zoom (`minZoom 0.1`, `maxZoom 2`), `onlyRenderVisibleElements` above 300 nodes; layout persistence with pending map + 400 ms debounce + rollback; viewport save 1 s debounce | `src/components/canvas/*`, `src/lib/canvas/*`, `src/app/app/a/[axisId]/[[...tab]]/page.tsx` | positions, sizes and viewport persist after reload |
| 5.3 | I | Node kinds: `note` (sticky, color from aurora, editable text), `text` (free text), `image` (drop/paste upload into Storage under the resource path rules), `link` (paste URL → unfurl), `task_ref` (live title, status, axis edge from the TanStack cache; click opens drawer), `resource_ref` (live title; click opens viewer); dangling refs render "Deleted item" (README §4.2) | `src/components/canvas/nodes/*` | a task reference updates when the task changes status |
| 5.4 | I | Interactions: double-click creates a note, drag a task or doc from a side panel listing the axis's items (or paste its link) to create a `task_ref` / `resource_ref`, resize (min 160×120), z-order `]` / `[`, delete with undo, copy/paste within and across axes | `src/components/canvas/*` | shortcut tests |
| 5.5 | T | Seed 300 nodes on one axis; Playwright trace of pan and zoom (frame-time digest); persistence e2e; live ref e2e | `scripts/seed-canvas.mjs`, `e2e/canvas*.spec.ts` | p95 frame ≤ 16.7 ms at 1x CPU |
| 5.6 | O | Gate + CHANGELOG | — | see Done when |

## Done when (plan)

- Positions and sizes persist after reload.
- A task reference updates when the task changes status.
- 300 nodes pan and zoom at 60 fps.

## Out of scope

Connectors between nodes (v2). No dnd-kit or Motion layout inside the canvas.
