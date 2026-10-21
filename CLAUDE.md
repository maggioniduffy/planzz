# Planzz

Personal life planner. Home = matrix of axes (columns: Work, Study, Other) x statuses
(rows: To do, Doing, Waiting, Done), all user-editable. Each axis has a workspace:
inner matrix (categories x statuses), calendar, free canvas, docs, resources, goals.
Plus routines, reminders (in-app, push, email), Google Calendar, BYOK AI chat.

- Product spec: docs/plan.md is an index; read only the docs/spec/*.md file a task names (what to build).
- Phase list and gates: docs/phases/index.md. Execution plan: docs/phases/README.md (how: loop, decisions, owner actions, status) and
  docs/phases/phase-N.md (ordered tasks, files and acceptance checks per phase).
- Verified API facts: docs/research-notes.md. They win over docs/plan.md and over model memory.
- Sibling project to copy from: github.com/maggioniduffy/things (same stack and design system).

## Stack
Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4 (@theme tokens) · shadcn/ui
motion · dnd-kit (matrices, sidebar) · React Flow @xyflow/react (axis canvas only)
FullCalendar v6 standard · Tiptap · TanStack Query v5 · Zustand · date-fns-tz · chrono-node
Supabase (@supabase/ssr, Postgres + RLS, Storage, Vault, pg_cron, pg_net)
web-push (VAPID) · Brevo · Google Calendar API · @anthropic-ai/sdk (browser, BYOK) · Vercel

## Rules
- No separate backend. Browser -> Supabase under RLS for CRUD. Browser -> Anthropic for AI.
  Route handlers only: /api/unfurl, /api/google/*, /api/cron/*, /auth/callback, /n/[token].
- Secret (service-role) key only in /api/cron/* and /api/google/* (server-only; google routes always
  scope to the user id from the verified session). Never in client code, never logged.
- The user's Anthropic key lives only in the browser. Never send it to our routes or store it in the DB.
- Every table has user_id + RLS; every cross-table FK includes user_id. New migration = new file; regenerate types.
- Every SQL function and trigger sets `search_path = ''` and uses schema-qualified names.
- Task position: one fractional index used by both matrices. All move logic goes through lib/matrix/move.ts.
- No transform: scale on the board. Zoom = semantic density levels; pan = native scroll.
- dnd-kit only in matrices/sidebar; React Flow only on the axis canvas; never mix. No Motion layout during drags.
- Scheduling math only in lib/schedule/* (pure, tz-aware, tested). Store instants as timestamptz,
  due dates as local date + time + profiles.timezone.
- Google Calendar is calendar-only: push dated tasks, read events. Routines and reminders never sync to Google.
- AI write tools always require an explicit Accept in the UI.
- Uploaded HTML renders only in <iframe sandbox="allow-scripts allow-forms allow-modals" srcdoc> (no allow-same-origin). Its scripts must run
  (e.g. quizzes made with Claude), so the app has no Content-Security-Policy. Never add allow-same-origin.
- Never render user or AI content with dangerouslySetInnerHTML; markdown and docx go through rehype-sanitize.
- Colors, radii, fonts only via tokens; no raw hex in components. Respect prefers-reduced-motion.
- Server state in TanStack Query with optimistic updates + rollback; UI-only state in Zustand.
- Guests are anonymous Supabase users: same code path, no localStorage data layer.
- UI copy in English, sentence case.
- Verify current docs before using: Next 16 proxy.ts, supabase-js auth linking, FullCalendar React,
  Anthropic SDK browser flag + model ids, web-push, Google OAuth scopes and verification.
  Next.js docs ship in node_modules/next/dist/docs; read them before using a Next API.

## Model routing
- Main session = Opus: orchestration, phase plans, analysis, review. No feature code.
- researcher (Haiku): docs/API verification, data fetching, summaries. Read-only.
- tester (Haiku): tests, long mechanical tasks. Never edits product code to pass tests.
- implementer (Sonnet): implements phase-plan tasks and Opus's fix lists; escalates design changes.
- Loop: plan (Opus) -> implement (Sonnet) -> test (Haiku) -> review (Opus) -> fixes -> done gate.

## Commands
pnpm dev · pnpm typecheck · pnpm lint · pnpm test · pnpm e2e
pnpm supabase start · pnpm supabase db reset · pnpm supabase test db
pnpm supabase gen types typescript --local > src/types/database.types.ts

## Env
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY,
CRON_SECRET, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT,
BREVO_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_TURNSTILE_SITE_KEY

## Definition of done (every phase)
typecheck + lint + tests green · no console errors · styleguide renders · CHANGELOG.md entry
