# Planzz — Execution plan

How `docs/plan.md` (the product spec) gets built. The spec says *what*; this folder says *who does what, in what order, and how we know it is done*. One file per phase (`phase-0.md` … `phase-10.md`) holds the ordered tasks.

Written 2026-10-14 by the orchestrator from `docs/plan.md` and from what the sibling project Things (`maggioniduffy/things`) learned building the same stack.

## 1. Roles

| Role | Model | Agent file | Does | Never does |
| --- | --- | --- | --- | --- |
| Orchestrator | Opus (main session) | — | Reads the plan, keeps these phase files current, sends researchers, reviews every diff against the phase file and the done gate, writes fix lists, commits, writes the CHANGELOG and opens the PR | Writes feature code beyond one-liners |
| researcher | Haiku | `.claude/agents/researcher.md` | Verifies the "Verify first" list of each phase, sweeps code or logs, returns cited summaries | Edits files |
| tester | Haiku | `.claude/agents/tester.md` | Writes and runs unit, pgTAP and Playwright tests; seeds, fixtures, type regeneration | Changes product code to pass a test |
| implementer | Sonnet | `.claude/agents/implementer.md` | Implements one task per run, runs typecheck + lint | Changes schema, architecture or plan (escalates) |

Rule of thumb: if the answer is a summary, send a researcher; if it is code, send the implementer; if it is a test, send the tester; if it is a decision or a verdict, Opus.

## 2. The loop (one phase = one session = one PR)

```
Opus: read CLAUDE.md + docs/phases/phase-N.md + the plan sections it names + research-notes
  │
  ├─► researcher(s), in parallel → the phase's "Verify first" list → findings into docs/research-notes.md
  │
Opus: adjust phase-N.md if research changed anything (record why under "Decisions")
  │
  ├─► implementer: task N.1 → report        (tasks marked ∥ may run in parallel in worktrees)
  ├─► tester: tests for N.1 → report
  │
Opus: review diff + test report against the task's acceptance checks
  │     problems → numbered fix list → implementer → tester → review again
  │     clean → commit "phaseN(N.1): <summary>"
  │
  … repeat per task …
  │
  └─ done gate (the phase's "Done when") → CHANGELOG entry → push branch → PR
```

- Branch per phase: `phase-N-<slug>`, PR into `main`, one commit per task.
- A report that says "deviated" or "blocked" goes back to Opus before anything else runs.
- Research that contradicts the spec goes into `docs/research-notes.md`; the spec stays as written and research notes win.
- Every phase ends green: `pnpm typecheck && pnpm lint && pnpm test`, plus `pnpm supabase test db` and `pnpm e2e` from Phase 1 on.
- Non-blocking review findings go into §7 (Carried-over findings) with the task that will fix them.

### Task table conventions

Each phase file lists tasks as `N.k`, with **Who**: `R` researcher · `I` implementer · `T` tester · `O` Opus. `∥` means the task touches files disjoint from the previous one and may run in parallel. Every task names its files and its acceptance checks; an implementer brief is the task row plus the "Read first" line of the phase.

## 3. Owner actions (need Faustino's accounts)

Everything before the "Needed by" task runs locally without them.

| # | Action | Needed by | Notes |
| --- | --- | --- | --- |
| O1 | Create a **new** Supabase cloud project (separate from Things); send URL, publishable key and secret key | Phase 1 cloud check (local dev uses `supabase start`) | Auth: Confirm email ON, anonymous sign-ins ON, manual identity linking ON, Site URL + redirect allow-list for `/auth/callback`; paste the email templates from `supabase/templates/`. Extensions `pg_cron`, `pg_net` enabled |
| O2 | Google OAuth client for **sign-in** (Supabase provider) | Phase 1 Google button (local can skip) | Redirect `https://<project>.supabase.co/auth/v1/callback` |
| O3 | Cloudflare Turnstile site key + secret, enable CAPTCHA in Supabase Auth | Production only | Local and e2e run with captcha off |
| O4 | Brevo account: API key (transactional) + SMTP credentials into Supabase Auth | Phase 7 email channel | 300 emails/day free |
| O5 | Vercel project linked to the repo, env vars, `CRON_SECRET` | Phase 3 daily cron on preview; Phase 10 production | Hobby plan |
| O6 | Generate VAPID keys (`pnpm dlx web-push generate-vapid-keys`) and store them in Vercel | Phase 7 production push | Local uses a dev pair in `.env.local` |
| O7 | Supabase Vault secret `cron_secret` and the production app URL for the `pg_cron` jobs (`supabase/setup/cron.sql`) | Phase 7 cloud, Phase 10 production | Never committed |
| O8 | iPhone with iOS ≥ 16.4 to install the PWA and receive a push | Phase 7 gate | Desktop Chrome covers the rest |
| O9 | Google Cloud project for **Calendar**: OAuth consent screen published "In production", Calendar API enabled, web client with redirect `https://<app>/api/google/callback` (+ localhost) | Phase 8 | Refresh tokens expire after about 7 days while the app is in "Testing" |
| O10 | An Anthropic API key for the manual AI check | Phase 9 gate | e2e mocks Anthropic; the key is only for the final manual run |

## 4. Spec review — decisions that bind the phases

Found while analysing `docs/plan.md`. Each one is applied in the phase named. Items marked *ask* need Faustino's call before that phase starts; the default in bold applies if nobody objects.

**Data integrity and security**

1. **Composite FKs everywhere.** The plan's own rule ("every cross-table FK includes user_id") is not applied to `subtasks.task_id`, `task_resources`, `routines.axis_id`, `routine_logs.routine_id`, `reminders.task_id/routine_id`, `calendar_links.axis_id`, `ai_threads.axis_id`, `ai_messages.thread_id`. FK checks bypass RLS, so a guessed UUID could link to another user's row. Fix: add `unique (id, user_id)` to `tasks`, `resources`, `routines`, `reminders`, `ai_threads`, and make those FKs composite (`on delete set null (axis_id)` where the plan has set null). Phase 1.
2. **`canvas_nodes.ref_id`** stays a plain uuid (polymorphic, no FK). Reads go through RLS, so another user's row never resolves; a dangling or foreign ref renders as "Deleted item". Phase 5.
3. **Attachments across axes.** `task_resources` is only enforced per user; "same axis" is a UI rule. A cross-axis move keeps the links. Phase 4.
4. **`completed_at` is set by a trigger**, not by the client: `before insert or update of status_id` on `tasks` sets it to `now()` when entering an `is_done` status and to null when leaving; toggling `statuses.is_done` updates the affected tasks. `move.ts` stops writing it. Keeps `move_tasks`, the AI tools and Google "Make a task" consistent. Phase 1 (trigger), Phase 3 (move.ts).
5. **Structure limits in the database**: 1–8 axes, 2–6 statuses with at least one non-done, 0–20 categories per axis, enforced with constraint triggers plus the UI. Phase 1.
6. **`search_path = ''`** on every function and trigger; `updated_at` maintained by a `before update` trigger (Things findings). Phase 1.
7. **Guest quota on the real object**: a `before insert or update` trigger on `storage.objects` for bucket `planzz` (size from `metadata->>'size'`, owner from `owner_id`), with the `resources` trigger kept as the friendly early check. Ported from Things. Phase 1.
8. **Email action links must not act on GET.** Mail scanners prefetch links, so `/n/[token]` shows a "Mark done" / "Snooze" button that POSTs; only the service worker's action (a deliberate tap) consumes directly. Phase 7.
9. **Stale relative reminders.** Every due-date write goes through `lib/tasks/mutations.ts`, which recomputes offset reminders; the dispatcher also re-derives `due + offset` at fire time and reschedules instead of sending when they differ (covers writes from other devices or the AI). Phase 7.
10. **Uploaded HTML runs its scripts; no CSP** (Faustino, 2026-10-14). The goal is to open interactive HTML such as a quiz made with Claude. An `iframe srcdoc` inherits the parent page's CSP, so the strict CSP planned for Phase 9 is dropped. Isolation comes from the sandbox: `sandbox="allow-scripts allow-forms allow-modals"`, never `allow-same-origin`, so the frame has an opaque origin and cannot reach cookies, storage, the BYOK key or the parent DOM. External `<script src>` (CDNs) load normally; `localStorage` inside the frame throws (opaque origin). XSS in the app itself is covered by sanitizing all rendered user/AI content (no `dangerouslySetInnerHTML`). Phases 4 and 9.

**Product details the spec leaves open**

11. **Filter URLs use the axis id**: `?cat.<axisId>=<categoryId>,…` (axes have no slug column; ids survive renames, as Things did for tags). Phase 2.
12. **In-app notifications refresh by polling** (TanStack `refetchInterval` 60 s and on focus); Supabase Realtime is not used in v1. Phase 7.
13. **"Send test" push** inserts a one-off reminder due now, so it travels the real dispatcher path; no extra route. Phase 7.
14. **FullCalendar time zone = the profile time zone only when it equals the browser's**; otherwise the existing timezone prompt (plan, Reminders step 5) appears first. No FullCalendar timezone plugin in v1. Phase 6.
15. ***ask* — Logo.** Planzz needs its own mark. **Default: a typographic wordmark ("planzz" in Inter Tight) plus a 2×2 matrix glyph** until a designed mark exists. Phase 0.

**Sequencing**

16. **Daily cron early.** Trash purge and auto-archive are user-visible from Phase 3, so `/api/cron/daily` lands there, first triggered by a `vercel.json` daily cron; Phase 7 moves it to `pg_cron` and adds guest cleanup and token expiry.
17. **DnD spike before the board DnD** (3.0): dnd-kit multi-container sortable inside a 2D scroll container with sticky headers, auto-scroll and drag-to-pan. Things already settled the dnd-kit × Motion pattern (research notes); this spike covers what is new.
18. **Perf harnesses with the feature**, not at the end: 200-task seed in Phase 2, 300-node canvas seed in Phase 5, 500-task drag trace in Phase 10.
19. **SQL functions land with their phase**: Phase 1 ships all tables, RLS, seeding and core RPCs (`move_tasks`, `matrix_counts`, `goal_progress`, `search_all` stub); dispatcher, Vault and Google RPCs land in Phases 7–8.

**Testability**

20. Auth e2e reads OTP codes from the local mail catcher; captcha off locally (Things).
21. Google and Brevo are faked in tests (a local HTTP fake behind an injectable base URL); real accounts are checked by hand at the gates.
22. Anthropic is mocked in e2e with Playwright `page.route`; the key-leak check inspects every request the page makes.
23. Push: unit-test payloads and the dispatcher with a fake sender; the gate checks real delivery by hand (O8).

## 5. Phase overview

Scope and "Done when" gates per phase: [index.md](index.md).

| Phase | File | Depends on | Unblocks |
| --- | --- | --- | --- |
| 0 Scaffold and design system | [phase-0.md](phase-0.md) | — | all |
| 1 Supabase, schema, auth, guests | [phase-1.md](phase-1.md) | 0 | 2+ |
| 2 App shell and main matrix (read) | [phase-2.md](phase-2.md) | 1 | 3 |
| 3 Tasks, DnD, structure editing | [phase-3.md](phase-3.md) | 2 | 4–10 (board usable) |
| 4 Workspace: Board, Resources, Docs, Goals | [phase-4.md](phase-4.md) | 3 | 5, 9 |
| 5 Free canvas per axis | [phase-5.md](phase-5.md) | 4 | — |
| 6 Calendar, Today, routines | [phase-6.md](phase-6.md) | 3 | 7, 8 |
| 7 Reminders and notifications | [phase-7.md](phase-7.md) | 6 | 8 (dispatcher) |
| 8 Google Calendar | [phase-8.md](phase-8.md) | 6, 7 | — |
| 9 AI chat | [phase-9.md](phase-9.md) | 4 (docs), 6 (calendar) | — |
| 10 Search, palette, polish, release | [phase-10.md](phase-10.md) | all | release |

Phases 5 and 6 are independent after 4 and 3 respectively; 9 can start any time after 6.

## 6. Status

| Phase | Status | PR |
| --- | --- | --- |
| Planning | done | |
| 0 Scaffold and design system | done (on `claude/zealous-ptolemy-l2lpos`) | |
| 1 Supabase, schema, auth, guests | not started | |
| 2 App shell and main matrix | not started | |
| 3 Tasks, DnD, structure editing | not started | |
| 4 Workspace | not started | |
| 5 Canvas | not started | |
| 6 Calendar, Today, routines | not started | |
| 7 Reminders | not started | |
| 8 Google Calendar | not started | |
| 9 AI chat | not started | |
| 10 Search, polish, release | not started | |

## 7. Carried-over findings

Non-blocking review findings, each with the task that fixes it.

| Finding | Fix in |
| --- | --- |
| Landing links to `/login`, which 404s until Phase 1; Next prefetch logs a console 404 on `/` in production | 1 (login route) |
| Landing has no "how it works" / guest / FAQ sections (kept short on purpose); `Grain` mounts in the marketing layout, not the root layout | 2 (app shell decides where `Grain` lives) |
| CI has no e2e job yet | 1 (as planned) |

## 8. Session kickoff prompt (paste at the start of each phase)

```
Phase N. You are the orchestrator (Opus). Read CLAUDE.md, docs/phases/README.md §1–4,
docs/phases/phase-N.md, the docs/spec files it names (map in docs/plan.md), and docs/research-notes.md.
1. Send researchers for the phase's "Verify first" list; record findings in docs/research-notes.md.
2. Run the tasks in order: implementer per task, tester after it, your review, commit per task.
   Parallel only where marked ∥, each in its own worktree.
3. Run the done gate, write the CHANGELOG entry, update §6 Status, push phase-N-<slug>, open a PR.
Stop and ask only for owner actions (§3), *ask* decisions (§4), or a change to the spec.
```
