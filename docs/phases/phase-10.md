# Phase 10 — Search, palette, polish, release

**Goal:** accent- and typo-tolerant search with a full command palette and every shortcut; the motion pass, mobile layout, accessibility, error handling and performance; production deploy with `pg_cron` pointing at production.

**Branch:** `phase-10-release` · **Read first:** CLAUDE.md · plan §Features (Keyboard shortcuts, Motion), §Data model (`search_all`), §Costs and limits, §Risks · README §3 (owner actions), §7 (carried-over findings).

**Source to port:** Things `search_items` function and `08_search_column.test.sql`, `src/components/ui/command.tsx` usage, `src/components/ui/search-field.tsx`.

## Verify first (researcher)

- `@axe-core/playwright` usage and rule tags for WCAG 2.1 AA.
- Vercel production env, domains, and that no Vercel cron remains once `pg_cron` drives both jobs.
- Supabase production: `pg_cron` jobs present, Vault secrets set, auth redirect URLs.

## Tasks

| # | Who | Task | Files | Acceptance |
| --- | --- | --- | --- | --- |
| 10.1 | I | `search_all(q, lim)`: FTS (`search` columns) ∪ trigram on titles over tasks + resources, ranked, excluding deleted, security invoker, `search_path = ''`; pgTAP ("cancion" → "Canción", one-char typo, other user's rows never returned) | `supabase/migrations/*_search.sql`, `supabase/tests/database/*` | `supabase test db` green |
| 10.2 | I | Search field (`/`, debounced) with results popover; toolbar filter chips (priority, due: overdue / today / this week, has reminder) applied to both matrices and synced to the URL | `src/components/toolbar/*`, `src/lib/matrix/filters.ts` | — |
| 10.3 | I | Command palette (⌘K): search results (tasks, docs), actions (new task, mark done, move to axis/status, toggle AI, zoom), navigation (Board, Today, Calendar, axes, Routines, Settings, Trash) | `src/components/command/command-palette.tsx` | — |
| 10.4 | I | Shortcuts hook with chords (`G` then `B`/`T`/`C`), `1–8`, and the remaining keys of the plan table not done in Phase 3; a `?` shortcut sheet | `src/hooks/use-shortcuts.ts` | — |
| 10.5 | T | Sweep: matrix of every shortcut in the plan table vs. implementation vs. test; report gaps | — | zero gaps |
| 10.6 | I | Motion pass per the plan's motion table and the Things spec; `MotionConfig reducedMotion="user"`; aurora signature moments (empty cell hover, drop overlay, empty Today, streak, auth/landing) | across components | reduced-motion e2e |
| 10.7 | I ∥ | Mobile: board scrolls horizontally per axis (one column snap), dock as bottom sheet, sidebar as sheet, touch DnD (long press), workspace tabs scrollable | across components | Playwright at 390×844 |
| 10.8 | I | Errors: `error.tsx` per segment, `global-error.tsx`, `not-found.tsx`; offline banner; Supabase paused/unreachable message | `src/app/**` | — |
| 10.9 | I | Performance: 500-task seed, Playwright trace of a drag; memoize cards; virtualize Overview cells only if the trace demands it | `scripts/seed-board.mjs`, components | p95 frame ≤ 16.7 ms |
| 10.10 | T | axe on every route (signed in, guest, signed out); fix list back to implementer; carried-over findings (README §7) closed or re-homed to v2 | `e2e/a11y.spec.ts` | 0 critical |
| 10.11 | O | Release: owner actions O1, O3–O7 confirmed; production deploy; `pg_cron` jobs target the production URL; smoke test on the live URL (sign in, guest, add/move task, reminder push, Google push if connected); README for the repo; CHANGELOG `1.0.0` | — | see Done when |

## Done when (plan)

- "cancion" finds "Canción".
- axe shows no critical issues.
- 60 fps dragging on a 500-task board.
- Production deploy and `pg_cron` jobs point at the production URL.

## Out of scope

Everything in the plan's "Later (v2+)" column.
