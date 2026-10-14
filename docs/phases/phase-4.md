# Phase 4 — Axis workspace: Board, Resources, Docs, Goals

**Goal:** each axis opens into its workspace with the inner matrix, saved links, documents with an integrated viewer for every listed format, and goals with progress.

**Branch:** `phase-4-workspace` · **Read first:** CLAUDE.md · plan §Core concepts (Inner matrix), §Features (Axis workspace, Docs viewer, Goals), §Key flows (Documents) · README §4.3, §4.10 · research-notes "Unfurl / SSRF", "Supabase" (storage, quota).

**Source to port:** Things `src/lib/unfurl/*` (+ fixtures and tests), `src/app/api/unfurl/route.ts`, `src/lib/items/{upload,thumbnails,pdf-thumbnail,detect-kind}.ts`, `src/hooks/use-signed-urls.ts`, `src/stores/upload-store.ts`, `src/components/cards/{link-card,file-card,image-card,pdf-card}.tsx`, `src/components/drawer/previews.tsx`.

## Verify first (researcher)

- Versions and browser builds: `react-markdown`, `remark-gfm`, `rehype-sanitize`, `shiki` (web bundle, lazy grammar loading, size), `mammoth` (browser entry), `papaparse`.
- `iframe srcdoc` + `sandbox="allow-scripts allow-forms allow-modals"`: confirm opaque origin (no cookie/storage access, `parent.document` blocked) in Chrome, Safari and Firefox, and that inline and CDN scripts, form submit handlers and `alert` run (README §4.10).
- Supabase signed URL for a PDF in an `<iframe>`: content-type and `Content-Disposition` behavior.

## Tasks

| # | Who | Task | Files | Acceptance |
| --- | --- | --- | --- | --- |
| 4.1 | I | Workspace layout `/app/a/[axisId]/…`: header (emoji, name, color), tabs in a `SegmentedControl` (Board, Calendar, Canvas, Docs, Resources, Goals), `[[...tab]]` routing, unknown tab → 404, Calendar/Canvas stubs; number keys 1–8 open axes | `src/app/app/a/[axisId]/**`, `src/components/workspace/workspace-tabs.tsx` | Playwright: tabs keep the layout mounted |
| 4.2 | I | Inner matrix: generalize `Matrix` with a column source (axes for main; categories + "Uncategorized" for inner), cell ids `inner:<axisId>:<categoryId\|none>:<statusId>`, same zoom, DnD and keyboard; `move.ts` already covers inner moves | `src/components/matrix/*` | a move in the inner matrix updates the main matrix cache without reload |
| 4.3 | I ∥ | Resources: port unfurl (`lib/unfurl/*`, `/api/unfurl` with session check and per-user rate limit, SSRF tests), `ResourceCard` (title, image, favicon, domain, note), add by paste or URL field, grouped by category with reorder, edit note, delete to trash | `src/lib/unfurl/*`, `src/app/api/unfurl/route.ts`, `src/components/workspace/resource-*.tsx`, `src/lib/resources/*` | Things' SSRF cases rejected; fixture HTML parses |
| 4.4 | I | Docs list + upload: port the upload pipeline (row first, direct upload with user JWT, tus above 6 MB, client thumbnails for images and PDF page 1, signed URL batching, guest quota toast) into `resources` `kind = 'file'`; in-app markdown doc (`kind = 'doc'`, Tiptap, 1 s autosave); grouped by category | `src/lib/resources/upload.ts`, `src/components/docs/doc-list.tsx` | upload > 6 MB shows progress; guest over 25 MB sees the quota toast |
| 4.5 | I | `DocViewer` (`?doc=<id>`, full-height panel) and lazy-loaded viewers: Markdown (react-markdown + gfm + sanitize; editable for in-app docs), Html (signed URL fetch ≤ 2 MB → `iframe sandbox="allow-scripts allow-forms allow-modals" srcdoc`, scripts run, "Allow links" toggle adds `allow-popups`), Pdf (iframe on signed URL), Image (lightbox, zoom), Code/txt/json (shiki), Csv (papaparse table, first 1 000 rows), Docx (mammoth → sanitize), fallback file card with download | `src/components/docs/doc-viewer.tsx`, `src/components/docs/viewers/*` | each viewer has a unit test with a fixture |
| 4.6 | I | Goals: CRUD, reorder, progress mode tasks/numeric, `GoalCard` (bar in `--color-done`, days left, overdue red end), achieved/archived; goal picker in the task drawer (same axis only); goal chip on Detail cards; progress bar animation (400 ms) | `src/components/workspace/goal-*.tsx`, `src/lib/goals/*`, `src/components/task/task-drawer.tsx` | `goal_progress` matches done/linked counts |
| 4.7 | I | Task attachments: drawer section to link resources/docs of the same axis (README §4.3), opens viewer or link | `src/components/task/attachments.tsx`, `src/lib/tasks/attachments.ts` | — |
| 4.8 | T | Tests: HTML fixture with `<script>alert(document.cookie)</script>` and a script that tries `parent.document`, `localStorage`, `document.cookie` → nothing leaks (Playwright checks a canary cookie and a canary `localStorage` key); a quiz fixture (inline script + CDN script, buttons, score) is playable inside the viewer; render e2e for `.md`, `.html`, `.pdf`, `.docx`, `.csv`, code, image; inner↔main consistency; upload and quota | `e2e/*`, `src/**/*.test.tsx`, `e2e/fixtures/docs/*` | green |
| 4.9 | O | Gate + CHANGELOG | — | see Done when |

## Done when (plan)

- A task moved in the inner matrix shows the change in the main matrix without reload.
- An uploaded HTML file with `<script>alert(document.cookie)</script>` cannot read app cookies.
- `.md`, `.html`, `.pdf`, `.docx`, `.csv`, code and images all render.

## Out of scope

Canvas (Phase 5), workspace calendar (Phase 6), doc version history (v2).
