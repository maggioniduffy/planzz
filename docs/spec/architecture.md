# Architecture

> Part of the Planzz product spec. Index: [../plan.md](../plan.md)


The browser talks to Supabase directly for all CRUD under RLS, and to Anthropic directly for AI with the user's own key. Next.js server code only does what needs a secret or a third-party fetch: link unfurl, Google OAuth and Calendar calls, and the reminder dispatcher that Postgres `pg_cron` calls every minute.

```
                 ┌──────────────────────────── Browser (PWA) ───────────────────────────┐
                 │ React app · TanStack Query · Zustand · service worker (push)         │
                 └───┬───────────────────────┬──────────────────────────┬───────────────┘
   CRUD under RLS    │      AI (BYOK key)    │     unfurl, Google,      │ push messages
   (supabase-js)     │                       │     /n/[token]           │
                     ▼                       ▼                          ▼
 ┌────────────── Supabase ──────────────┐  Anthropic API   ┌──── Next.js on Vercel ────┐
 │ Postgres + RLS · Storage · Auth      │                  │ /api/unfurl               │
 │ Vault (Google refresh tokens)        │◄─────────────────┤ /api/google/*  (secret)   │──► Google Calendar API
 │ pg_cron ── pg_net (every minute) ────┼─────────────────►│ /api/cron/*    (secret)   │──► Brevo (email)
 └──────────────────────────────────────┘                  └───────────────────────────┘──► Web Push services
```

The browser does almost everything; Next.js only holds the Google, email, push and cron secrets, and Postgres decides when the server wakes up.

**Stack** (same as Things unless noted)

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript strict | Same as Things |
| Styling | Tailwind CSS v4 `@theme` tokens + shadcn/ui | Shared design system |
| Motion | `motion` (Motion for React) | Layout and spring animations |
| Matrix DnD | `@dnd-kit/core` + `@dnd-kit/sortable` | Multi-container sortable cells, keyboard sensor |
| Free canvas | React Flow `@xyflow/react` | Ported from Things |
| Calendar UI | FullCalendar v6 standard (`@fullcalendar/react`, daygrid, timegrid, list, interaction) | MIT; month/week/day/agenda + drag to reschedule. Premium plugins not needed |
| Rich text | Tiptap (+ markdown extension) | Task notes and in-app docs, stored as markdown |
| Doc viewers | `react-markdown`, `remark-gfm`, `rehype-sanitize`, `shiki`, `mammoth`, `papaparse`, `pdfjs-dist` | All client-side, no server cost |
| Dates | `date-fns` + `date-fns-tz`, `chrono-node` | Timezone-safe scheduling, quick-add parsing |
| Server state | TanStack Query v5 + `@supabase/supabase-js` | Optimistic updates + rollback |
| UI state | Zustand | Zoom level, filters, focus, dock, drag state |
| Auth / DB / Files | Supabase (`@supabase/ssr`) | Email OTP, Google, anonymous guests; Postgres + RLS; Storage |
| Scheduling | Supabase `pg_cron` + `pg_net` | Per-minute dispatch; Vercel Hobby cron is daily only |
| Secrets at rest | Supabase Vault | Google refresh tokens |
| Push | Web Push with VAPID via `web-push` (Node) + service worker | Free, no third-party push service |
| Email | Brevo transactional API + SMTP for Auth (fallback SMTP2GO) | 300/day free |
| Google | `googleapis` (Calendar v3) or plain `fetch` to the REST API | Server-only, with stored refresh token |
| AI | `@anthropic-ai/sdk` in the browser (`dangerouslyAllowBrowser: true`) | BYOK, streaming, tool use; key never hits the server |
| Bot protection | Cloudflare Turnstile | Guest sign-in, OTP |
| Ordering | `fractional-indexing` | One-row reorders |
| Utilities | `cmdk`, `sonner`, `vaul`, `lucide-react`, `zod` | Same as Things |
| PWA | Web app manifest + hand-written service worker (`public/sw.js`) | Required for iOS push; avoid heavy PWA plugins |
| Deploy | Vercel + Supabase cloud | Free tiers |

Claude Code should verify current APIs for: Next 16 `proxy.ts`, supabase-js anonymous/linking methods, FullCalendar React v6 setup, Anthropic browser access flag and current model IDs, `web-push` options, and Google OAuth consent/verification rules.

**Where code runs**

- **Server Components:** app shell, first paint of the board (axes, statuses, categories, open tasks prefetched into TanStack Query).
- **Client Components:** board, cells, cards, DnD, drawer, workspace tabs, viewers, canvas, calendar, AI chat.
- **Route Handlers (Node runtime):**
  - `POST /api/unfurl` — Things' SSRF-safe unfurl, reused for Resources.
  - `GET /api/google/connect`, `GET /api/google/callback` — Calendar OAuth (separate from sign-in).
  - `GET /api/google/events?from&to` — read Google events for the visible range.
  - `POST /api/google/calendars` — list / create the user's Google calendars for axis linking.
  - `POST /api/cron/dispatch` — called by `pg_cron` via `pg_net` every minute with a shared secret; sends due reminders (push, email) and drains the Google outbox.
  - `POST /api/cron/daily` — daily: digest emails, guest cleanup, trash purge, auto-archive.
  - `POST /api/push/subscribe` is not needed: subscriptions are inserted from the browser under RLS.
- **Service worker:** receives push, shows notifications with actions, handles clicks (focus/open `?task=`), posts "Done" / "Snooze" back via a signed one-time action URL.
- **Service-role key** only in `/api/cron/*` and `/api/google/*` (server-only). Google refresh tokens are read from Vault through functions granted to `service_role` only, and the Google routes always scope to the user id from the verified session.

**Routes**

| Route | Screen |
| --- | --- |
| `/` | Landing: aurora hero, "Try without an account" + "Sign in" |
| `/login`, `/auth/callback` | Email OTP + Google sign-in |
| `/app` | Board (main matrix) |
| `/app/today` | Today |
| `/app/calendar` | Global calendar, all axes |
| `/app/a/[axisId]` | Axis workspace → Board tab |
| `/app/a/[axisId]/calendar` · `/canvas` · `/docs` · `/resources` · `/goals` | Workspace tabs |
| `/app/routines` | Routines list, heatmaps, standalone reminders |
| `/app/trash` | Trash |
| `/app/settings` | Account, axes/statuses editor, notifications (push devices, email digest, timezone), integrations (Google), AI key, export JSON, danger zone |
| `/n/[token]` | Notification action landing (Done / Snooze) for platforms without action buttons |
| `/styleguide` (dev) | Tokens, components, motion |

Any `/app` route accepts `?task=<id>` (drawer) and `?doc=<id>` (viewer).

**Folder structure**

```
src/
  app/
    (marketing)/page.tsx
    (auth)/login/page.tsx
    auth/callback/route.ts
    app/layout.tsx               # sidebar, dock, providers
    app/page.tsx                 # Board
    app/today/page.tsx
    app/calendar/page.tsx
    app/a/[axisId]/layout.tsx    # workspace header + tabs
    app/a/[axisId]/[[...tab]]/page.tsx
    app/routines/page.tsx
    app/trash/page.tsx
    app/settings/[[...section]]/page.tsx
    n/[token]/page.tsx
    api/unfurl/route.ts
    api/google/{connect,callback,events,calendars}/route.ts
    api/cron/{dispatch,daily}/route.ts
    styleguide/page.tsx
  components/
    ui/  brand/                  # copied from Things
    matrix/    # Matrix, MatrixViewport (pan/zoom), Cell, ColumnHeader, RowHeader, CategoryFilter
    task/      # TaskCard, TaskDrawer, QuickAdd, SubtaskList, ReminderPicker
    workspace/ # WorkspaceTabs, GoalCard, ResourceCard
    docs/      # DocList, DocViewer, viewers/{Markdown,Html,Pdf,Image,Code,Csv,Docx}
    canvas/    # ported from Things
    calendar/  # CalendarView (FullCalendar wrapper), event renderers
    routines/  # RoutineList, Heatmap
    ai/        # ChatDock, MessageList, ToolCard, ConfirmCard, KeySettings
    account/   # GuestBanner, UpgradeDialog, OtpForm
    command/   # CommandPalette
  lib/
    supabase/  # client.ts, server.ts, admin.ts (cron only), proxy.ts
    tasks/     # queries.ts, mutations.ts, parse-quick-add.ts
    matrix/    # move.ts (cell move -> patch), zoom.ts
    schedule/  # next-fire.ts (pure, tz-aware), streaks.ts
    notify/    # push.ts, email.ts, templates/
    google/    # oauth.ts, calendar.ts, outbox.ts
    ai/        # client.ts, tools.ts (zod schemas + executors), context.ts
    unfurl/    # from Things
    order.ts
  stores/      # ui-store.ts
  hooks/
  types/database.types.ts
public/
  sw.js  manifest.webmanifest  icons/
supabase/
  migrations/  seed.sql
```

