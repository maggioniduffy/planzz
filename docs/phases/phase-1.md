# Phase 1 — Supabase, schema, auth, guests

**Goal:** the whole v1 schema with RLS and seeding, proven isolated by SQL tests; sign-in by email OTP, Google and guest, with guest upgrade keeping the user id.

**Branch:** `phase-1-supabase-auth` · **Read first:** CLAUDE.md · plan §Data model (all), §Core concepts (Rules), §Features (Guest mode), §Build phases (Phase 1) · README §4 items 1, 4–7, 19, 20 · research-notes "Supabase", "Cloud container".

**Source to port:** Things `supabase/config.toml`, `supabase/templates/*`, `supabase/migrations/20260101000100_extensions_helpers.sql` (f_unaccent), `…000500_storage.sql` (policies + quota trigger), `supabase/tests/database/*` (patterns), `src/lib/supabase/*`, `src/proxy.ts`, `src/lib/auth/*`, `src/components/account/*`, `src/app/(auth)/**`, `src/app/auth/callback/route.ts`, `e2e/helpers/*`, `e2e/mailpit.ts`.

## Verify first (researcher)

- Local stack in this container (research-notes "Cloud container"): `pg_cron`, `pg_net` and `supabase_vault` available locally; `create extension pg_cron` allowed in a migration.
- A stored generated `tsvector` column calling `f_unaccent` (Things' immutable wrapper) works on PG17.
- `auth.users` insert trigger works for anonymous sign-ins (seeding guests).

## Owner actions

O1 (cloud project) for the cloud check only; O2 for the Google button. Local work does not wait for them.

## Tasks

| # | Who | Task | Files | Acceptance |
| --- | --- | --- | --- | --- |
| 1.1 | I | `pnpm supabase init`; port `config.toml` settings from Things (anonymous on, manual linking on, `double_confirm_changes = false`, local email rate limit raised, redirect URLs) and the three OTP email templates (Planzz copy) | `supabase/config.toml`, `supabase/templates/*` | `supabase start` works with the registry override |
| 1.2 | I | Migration `0100_extensions_helpers`: extensions, `f_unaccent`, `set_updated_at()` trigger function, all with `search_path = ''` | `supabase/migrations/*_extensions_helpers.sql` | `db reset` clean |
| 1.3 | I | Migration `0200_structure`: `profiles`, `axes`, `statuses`, `categories`, `goals`, `tasks`, `subtasks` exactly as the plan, plus: `unique (id, user_id)` on `tasks`; composite FK `subtasks (task_id, user_id)`; `updated_at` triggers; **completed_at trigger** (README §4.4) incl. the `statuses.is_done` toggle; **structure-limit constraint triggers** (1–8 axes, 2–6 statuses with ≥ 1 non-done, ≤ 20 categories per axis; README §4.5); indexes from the plan | `supabase/migrations/*_structure.sql` | `db reset` clean; `db lint` no errors |
| 1.4 | I | Migration `0300_workspace`: `resources` (+ `unique (id, user_id)`), `task_resources` with composite FKs to `tasks (id, user_id)` and `resources (id, user_id)`, `canvas_nodes` | `supabase/migrations/*_workspace.sql` | same |
| 1.5 | I | Migration `0400_scheduling`: `routines` (+ `unique (id, user_id)`, composite `(axis_id, user_id)` FK with `on delete set null (axis_id)`), `routine_logs` (composite FK), `reminders` (+ `unique (id, user_id)`, composite FKs to task and routine), `push_subscriptions`, `notifications`, `notification_actions`; `reminders_due` index | `supabase/migrations/*_scheduling.sql` | same |
| 1.6 | I | Migration `0500_integrations`: `google_accounts`, `calendar_links` (composite axis FK), `gcal_outbox`, `ai_threads` (+ `unique (id, user_id)`, composite axis FK), `ai_messages` (composite thread FK) | `supabase/migrations/*_integrations.sql` | same |
| 1.7 | I | Migration `0600_rls`: the Things policy on every table; `google_accounts` select-only; `notification_actions` no client policies; `notifications` select + update(`read_at`) only | `supabase/migrations/*_rls.sql` | — |
| 1.8 | I | Migration `0700_functions`: `handle_new_user()` (profile + Work/Study/Other in blue/violet/olive + To do/Doing/Waiting/Done with fractional positions), `move_tasks(ids, axis_id, status_id, category_id, positions)` (security invoker, nulls `goal_id` on cross-axis), `matrix_counts` view and `goal_progress` view (security invoker), `search_all` stub (returns empty; real one in Phase 10) | `supabase/migrations/*_functions.sql` | — |
| 1.9 | I | Migration `0800_storage`: private bucket `planzz` (50 MB limit), `storage.foldername` policies, guest quota trigger on `storage.objects` (10 MB/file, 25 MB total for `is_anonymous`) + friendly `resources` trigger (README §4.7) | `supabase/migrations/*_storage.sql` | — |
| 1.10 | T | pgTAP suites: (a) user A cannot select/update/delete B's rows in every table; (b) A cannot insert a task/category/subtask/reminder/routine/calendar_link/ai_message pointing at B's axis/status/category/task/routine/thread ids; (c) a task's category from another axis is rejected; (d) seeding for a normal user and an anonymous user (3 axes + 4 statuses, 1 done); (e) limits: 9th axis, 7th status, deleting the last non-done status, 21st category rejected; (f) completed_at set/cleared on status changes and on `is_done` toggle; (g) storage path policies and guest quota; (h) `move_tasks` cross-axis nulls category and goal | `supabase/tests/database/*.test.sql` | `pnpm supabase test db` green |
| 1.11 | I | Supabase clients and proxy: port `lib/supabase/{client,server,admin,env,proxy}.ts` and `src/proxy.ts` (refresh session; redirect unauthenticated `/app/**` to `/login`); `pnpm db:types` → `src/types/database.types.ts` | `src/lib/supabase/*`, `src/proxy.ts`, `src/types/*` | unauthenticated `/app` → `/login` |
| 1.12 | I | Auth UI: port `/login` (email → 6-digit code), Google button, `/auth/callback`, sign-out, Turnstile field (rendered only with a site key), landing "Try without an account" → `signInAnonymously` → `/app` (placeholder page), `GuestBanner`, `UpgradeDialog` (email `email_change`, Google `linkIdentity`, conflict copy) | `src/app/(auth)/**`, `src/app/auth/callback/route.ts`, `src/lib/auth/*`, `src/components/account/*`, `src/app/app/page.tsx` (placeholder) | Things' unit tests ported and green |
| 1.13 | T | e2e: OTP login through Mailpit; guest start → `/app`; guest upgrade by email keeps `user.id` and the seeded axes; CI e2e job (Supabase start + `supabase test db` + Playwright) | `e2e/*`, `.github/workflows/ci.yml` | `pnpm e2e` green locally and in CI |
| 1.14 | O | Gate review focused on RLS, composite FKs and storage policies; CHANGELOG | — | see Done when |

## Done when (plan)

- SQL tests prove user A cannot read/write user B's rows or reference B's axis/status/category ids.
- A new user and a guest both get 3 axes + 4 statuses.
- Guest upgrade keeps the user id.

## Out of scope

Dispatcher, Vault and Google RPCs (Phases 7–8), real `search_all` (Phase 10), any board UI.
