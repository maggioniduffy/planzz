# Phase index

> Extracted from the product plan. Status, dependencies and per-phase task files: [README.md](README.md) §5–6. Task tables: `phase-N.md`.

Eleven phases, all MVP, each one Claude Code session (or one PR) with a "done" gate. Every session starts by reading `CLAUDE.md` and this plan's section for the phase, and ends with typecheck, lint, tests and a CHANGELOG entry. The board is usable after Phase 3; integrations come last because each one is independent.

1. **Phase 0 — Scaffold and design system**
   - Next.js 16 + TS strict + Tailwind v4 + shadcn; ESLint, Prettier, Vitest, Playwright.
   - Copy Things tokens, fonts, `<Grain />`, `<Aurora />`, restyled primitives; add Planzz tokens and Logo; `/styleguide`; landing page.
   - **Done when:** `/styleguide` shows every token and component; Lighthouse performance ≥ 90 on `/`; reduced motion disables drift.
2. **Phase 1 — Supabase, schema, auth, guests**
   - Migrations for every table in Data model, composite FKs, RLS, bucket + storage policies, `handle_new_user` seeding, guest quota trigger, `gen types`.
   - `@supabase/ssr` clients, `proxy.ts`, `/login` (email OTP + Google), anonymous sign-in with Turnstile, GuestBanner + upgrade (copied from Things).
   - **Done when:** SQL tests prove user A cannot read/write user B's rows or reference B's axis/status/category ids; a new user and a guest both get 3 axes + 4 statuses; guest upgrade keeps the user id.
3. **Phase 2 — App shell and main matrix (read)**
   - Sidebar, toolbar, right dock, Zustand store, TanStack Query hydration.
   - `Matrix`, `MatrixViewport` with pan, 3 semantic zoom levels, sticky headers, row collapse; `TaskCard` at each density; per-column category filter chips with URL state; `matrix_counts`.
   - **Done when:** 200 seeded tasks render with no layout shift; zoom steps keep the pointed cell in place; filtering one column leaves others untouched and survives reload.
4. **Phase 3 — Tasks, DnD and structure editing**
   - Quick add (inline per cell, N, ⌘K) with `parse-quick-add`; task drawer with every field, subtasks, Tiptap notes; mark done, archive, trash + undo.
   - dnd-kit multi-container sortable on the main matrix, `move.ts` + `move_tasks` RPC, multi-select drag, drag onto sidebar axes, keyboard DnD and ⌘-arrow moves.
   - Settings editor for axes, statuses, categories (CRUD, reorder, color, delete with reassignment).
   - **Done when:** reorder persists with a single-row update; a cross-axis move nulls the category; moving 5 selected tasks is one RPC call; deleting a status forces reassignment; all `move.ts` cases are unit-tested.
5. **Phase 4 — Axis workspace: Board, Resources, Docs, Goals**
   - Workspace layout + tabs; inner matrix reusing Phase 2–3 components.
   - Resources with `/api/unfurl` (ported from Things, SSRF tests included); Docs list, upload pipeline, in-app markdown docs, every viewer in the Docs viewer table.
   - Goals CRUD, linking tasks, `goal_progress` view.
   - **Done when:** a task moved in the inner matrix shows the change in the main matrix without reload; an uploaded HTML file with `<script>alert(document.cookie)</script>` cannot read app cookies; `.md`, `.html`, `.pdf`, `.docx`, `.csv`, code and images all render.
6. **Phase 5 — Free canvas per axis**
   - Port Things' React Flow canvas onto `canvas_nodes`: notes, text, images, link cards, task and resource references (live title/status), viewport per axis.
   - **Done when:** positions and sizes persist after reload; a task reference updates when the task changes status; 300 nodes pan and zoom at 60 fps.
7. **Phase 6 — Calendar, Today, routines**
   - FullCalendar wrapper styled to tokens; per-axis and global calendars with tasks (due + blocks), routines and goal deadlines; drag to reschedule / resize blocks.
   - Today view; routines CRUD, check-off with `routine_logs`, streaks, 12-week heatmap; timezone in profile.
   - **Done when:** dragging a block in week view updates `block_start/end`; streaks are correct across skipped weekdays (unit tests); Today shows exactly overdue + due today + blocks today.
8. **Phase 7 — Reminders and notifications**
   - `next-fire.ts` with DST tests; reminder picker on tasks, routines, standalone; in-app notifications inbox.
   - Service worker, manifest, push subscribe flow with iOS install guidance; `/api/cron/dispatch`, `claim_due_reminders`, Brevo email + digest; `notification_actions` + `/n/[token]`; `pg_cron` jobs; `/api/cron/daily`.
   - **Done when:** a reminder set for 2 minutes ahead arrives by push on desktop Chrome and on an installed iPhone PWA, and by email; "Snooze 1h" from the notification reschedules it; running the dispatcher twice for the same slot sends once.
9. **Phase 8 — Google Calendar**
   - OAuth connect/callback, Vault storage, calendar linking UI, outbox trigger + worker, event read endpoint, "Make a task" from an event, revoked-token handling.
   - **Done when:** a task with a time block appears in the linked Google calendar within 2 minutes, moves when rescheduled, gets "✓" when done and disappears when deleted; Google events show read-only in the axis calendar.
10. **Phase 9 — AI chat**
    - Key settings + validation, ChatDock, streaming loop, tool schemas and executors, confirm cards, thread persistence, context builder.
    - **Done when:** "Create 3 study tasks for Física II this week" proposes 3 tasks, creates them only after Accept, and they appear in the matrix; the key never appears in any network request to the app's own domain or in the database.
11. **Phase 10 — Search, palette, polish, release**
    - `search_all` RPC, search field, ⌘K with tasks/docs/actions/navigation, every shortcut.
    - Motion pass, mobile layout (board scrolls horizontally per axis, dock becomes bottom sheet), a11y audit, error boundaries, production deploy.
    - **Done when:** "cancion" finds "Canción"; axe shows no critical issues; 60 fps dragging on a 500-task board; production deploy and `pg_cron` jobs point at the production URL.
