# Planzz — Product & Build Plan

Oct 14, 2026 · @Faustino

## Overview

Planzz is a personal life planner whose home screen is one matrix: life areas as columns (Work, Study, Other), task states as rows (To do, Doing, Waiting, Done). Each area opens into its own workspace with a matching inner matrix, calendar, free canvas, documents, resources and goals. Same stack and conventions as Things: Next.js + Supabase, no separate backend, guest mode, $0 to run for one heavy user.

**Principles**

- **One screen to see your life.** The main matrix answers "what is everything I have going on, and where is it stuck" without navigating.
- **Zoom in without leaving.** Each area column filters by its own categories in place; the full area workspace is one click away.
- **Everything is editable.** Areas, states and categories are user data, not hardcoded enums.
- **Calm, tactile UI.** The Things visual language: light grainy surfaces, aurora gradients as atmosphere, spring motion.
- **Cheap to run.** Free tiers only. AI is bring-your-own-key, so it costs the owner nothing.

**Glossary** (used throughout this doc and in code)

| Term | Meaning | Default values |
| --- | --- | --- |
| Axis | A life area; a column of the main matrix, with its own workspace | Work, Study, Other |
| Status | A row of every matrix; shared by all axes | To do, Doing, Waiting, Done |
| Category | A sub-area inside one axis; a column of that axis's inner matrix | e.g. Study → Física II, Química |
| Task | A card; belongs to exactly one axis, at most one category, one status |  |
| Workspace | The per-axis screen: Board, Calendar, Canvas, Docs, Resources, Goals |  |
| Routine | A daily habit checklist item, optionally on some weekdays and with a reminder |  |
| Reminder | A scheduled notification (one-off or daily) on a task, a routine, or standalone |  |

**Scope**

|  | MVP (v1) | Later (v2+) |
| --- | --- | --- |
| Board | Main matrix with pan + semantic zoom, editable axes/statuses, per-column category filter, DnD between cells | WIP limits per cell, swimlane collapse rules, automations |
| Axis workspace | Inner matrix, calendar, free canvas, documents with viewers, resources (link unfurl), goals | Canvas connectors, doc version history |
| Planning | Due dates, time blocks, subtasks, priorities, Today view, daily routines with streaks | Recurring tasks, weekly review flow |
| Reminders | In-app, web push (PWA), email; daily digest | SMS / Telegram |
| Calendar | Internal calendar per axis + global; Google Calendar: push Planzz items, read Google events | Full two-way edit sync |
| AI | Chat panel, BYOK Anthropic key, tools over your tasks/notes with confirm-before-write | Other providers, AI daily planning, embeddings search |
| Find | Full-text + fuzzy search over tasks and docs, ⌘K | Semantic search |

## Visual language

Planzz reuses the Things design system as is: same tokens, `<Grain />`, `<Aurora />`, outlined icon buttons, hairline dividers, Inter + Inter Tight, shadcn/ui restyled. Phase 0 copies `globals.css` tokens and `components/brand` from the Things repo (extracting a shared package is a v2 decision). Only the additions below are new.

**Axis colors.** Each axis gets one aurora stop as its identity color, used for the column header dot, card left edge (2px), calendar events and canvas accents. New axes cycle through the remaining stops.

| Axis (default) | Token | Hex |
| --- | --- | --- |
| Work | `--aurora-blue` | `#4F63DE` |
| Study | `--aurora-violet` | `#8E6CF0` |
| Other | `--aurora-olive` | `#A9A55C` |
| (next) | `--aurora-pink`, `--aurora-coral`, `--aurora-red` |  |

**New tokens**

| Token | Value | Use |
| --- | --- | --- |
| `--color-cell` | `rgb(255 255 255 / 0.45)` + `backdrop-blur-sm` | Matrix cell background |
| `--color-cell-over` | `rgb(142 108 240 / 0.08)` | Cell highlight while dragging over |
| `--color-grid-dot` | `rgb(15 15 18 / 0.10)` | Dot grid behind the matrix and canvas |
| `--color-done` | `#3E9B6C` | Done check, streaks, goal progress (only non-aurora color) |
| `--radius-cell` | `16px` | Matrix cells |
| `--size-row-header` | `140px` | Sticky row header width |

**Matrix look.** The board sits on the `--color-paper` background with a dot grid under the grain. Cells are rounded glass panels separated by 12px gutters, not table lines. Column headers (axis name, color dot, category filter chips, count) stick to the top; row headers (status name, count) stick to the left. The Done row renders at 70% opacity and collapses by default to a single line with its count.

**Signature moments.** Aurora appears in empty cells' hover state (a faint glow from the bottom), the drop overlay, the empty Today view ("Nothing pending. Breathe."), the routine streak celebration, and auth/landing. The content area stays calm otherwise.

## Core concepts

One task lives in one cell of the main matrix (axis × status) and, inside its axis, in one cell of the inner matrix (category × status). Statuses are shared, so both views always agree on a task's state.

**Main matrix** — columns = axes, rows = statuses. A column header carries filter chips for that axis's categories (All · Física II · Química · Uncategorized); picking one filters only that column, in place. Multiple chips can be active (OR). Filters persist per axis in the URL (`?cat.<axisSlug>=<categoryId>,…`) so a filtered board is linkable.

**Inner matrix** (axis workspace → Board tab) — columns = that axis's categories plus a trailing "Uncategorized" column, rows = the same statuses. Same card components and DnD as the main matrix.

**Moves and what they change**

| Drag | Main matrix | Inner matrix |
| --- | --- | --- |
| Within a cell | `position` | `position` |
| Across rows | `status_id` (+ `completed_at` when entering an `is_done` status) | same |
| Across columns | `axis_id`; `category_id` reset to null (toast offers "Pick category") | `category_id` |
| Onto a sidebar axis | `axis_id`, category null | `axis_id`, category null |

**Rules**

- Axes: 1–8, reorderable, renamable, color + optional emoji. Deleting an axis requires moving or deleting its tasks first (dialog with a target picker).
- Statuses: 2–6, reorderable, renamable. Exactly the statuses flagged `is_done` count as completed for goals, streak stats and the Done styling. At least one non-done status must exist.
- Categories: 0–20 per axis, reorderable, color optional. Deleting one sets its tasks to Uncategorized.
- Ordering: one fractional `position` per task. The main cell shows all of an axis's tasks for that status; the inner cell shows a subset in the same relative order, so a reorder in either view stays consistent in the other.
- A database constraint guarantees a task's category belongs to the task's axis (composite FK, see Data model).
- New users are seeded with 3 axes and 4 statuses by a trigger, guests included.

## Features and UX

The app is three places: the Board (main matrix, home), Today (what to do now), and each axis workspace. A right dock holds either the task drawer or the AI chat.

**Layout**

- **Sidebar (240px, collapsible):** wordmark · Board · Today · Calendar · *Axes* (color dot, emoji, open-task count; drop targets) · Routines · Settings. Footer: guest banner when anonymous.
- **Toolbar:** search (/), filter chips (priority, due: overdue / today / this week, has reminder), zoom level control, "+ Task" primary button, AI toggle (⌘J).
- **Right dock (400px, resizable):** task drawer (`?task=<id>`, linkable) or AI chat. On mobile both become bottom sheets (vaul).

**Board — the restricted canvas**

The matrix behaves like a bounded canvas, implemented without CSS transforms so dnd-kit measures correctly:

- **Pan:** native 2D scroll of the board container, plus drag-to-pan on empty gutters (pointer drag with grab cursor) and space + drag. Scroll bounds = the matrix edges + 48px; no infinite space.
- **Semantic zoom, 3 levels** (⌘− / ⌘+ / pinch steps; Shift+1 fits the whole matrix by choosing the densest level that fits):

| Level | Column width | Card shows |
| --- | --- | --- |
| Overview | 220px | Title only, one line, axis edge; cells cap at 12 cards + "+N more" |
| Default | 300px | Title, category chip, due badge, priority dot, subtask progress |
| Detail | 380px | Default + first 2 lines of notes, reminder bell, goal chip |

- Sticky column and row headers stay visible while panning. Each row can collapse to a single line (Done collapsed by default).
- Cell footer: "+ Add" inline input creating a task in that axis × status (and the active category filter, if exactly one is selected).
- Card quick actions on hover: open, mark done (moves to the first `is_done` status), set due, delete.

**Task**

| Field | Notes |
| --- | --- |
| Title | Required. Quick-add parses `#category`, `!high` / `!med` / `!low`, and a date phrase ("tomorrow 18:00", "fri") via `chrono-node` |
| Notes | Markdown, edited in the drawer (Tiptap with markdown in/out) |
| Axis, category, status | Pickers; mirror the matrix position |
| Priority | none · low · med · high |
| Due | Date, optional time |
| Time block | Optional start + end; shows on calendars and syncs to Google |
| Subtasks | Checklist, reorderable |
| Goal | Optional link to one goal of the same axis |
| Reminders | 0–5, relative to due or absolute (see Reminders) |
| Attachments | Links to resources/docs of the same axis |

Item states: active → done (`completed_at`), archive (Done tasks older than 14 days auto-archive, configurable), soft delete to Trash with 30-day purge; every destructive action shows an Undo toast.

**Axis workspace** (`/app/a/[axisId]/…`, tabs in a segmented control under the axis title)

| Tab | What it is |
| --- | --- |
| Board | Inner matrix: categories × statuses, same zoom and DnD as the main board |
| Calendar | Month / week / day / agenda of this axis: due tasks, time blocks, routines, goal deadlines, and events from the Google calendar(s) linked to the axis. Drag to reschedule |
| Canvas | Infinite free-form board (React Flow, ported from Things): sticky notes, text, images, link cards, references to tasks and docs. Pan, zoom, multi-select, resize, z-order, snap |
| Docs | Files and in-app markdown documents, grouped by category, with an integrated viewer |
| Resources | Saved links (unfurled like Things: title, image, favicon), grouped by category, with a note per link |
| Goals | Objectives with a target date and progress (from linked tasks or a manual numeric target) |

**Docs viewer** (opens in a full-height panel, `?doc=<id>`)

| Format | Viewer |
| --- | --- |
| `.md` (uploaded or created in-app) | `react-markdown` + `remark-gfm` + `rehype-sanitize`; in-app docs are editable (Tiptap) |
| `.html` | Sandboxed `<iframe srcdoc>` with `sandbox="allow-scripts"` and no `allow-same-origin`, so page scripts can never reach the app's cookies or storage |
| `.pdf` | Browser PDF viewer in an iframe on a signed URL; first-page thumbnail via `pdfjs-dist` |
| Images | Lightbox with zoom |
| `.txt`, code, `.json`, `.csv` | `shiki` syntax highlighting; CSV as a table (`papaparse`) |
| `.docx` | Converted client-side to HTML with `mammoth`, then sanitized |
| Anything else | File card with download |

**Goals**

- Fields: title, description, target date, progress mode: *tasks* (done linked tasks / all linked tasks) or *numeric* (current / target + unit, e.g. 12 / 20 chapters).
- A goal card shows a progress bar in `--color-done` and days left; overdue goals turn `--aurora-red` at the bar end.

**Today** (`/app/today`)

- Routines due today as a checklist with streak counts.
- Tasks overdue + due today + time-blocked today, grouped by axis, in a compact day timeline.
- Upcoming reminders for the rest of the day.

**Routines and reminders**

- **Routine:** title, optional axis, weekdays (default every day), optional time and reminder. Checking it off writes a log for the user's local date; streak = consecutive scheduled days completed. A 12-week heatmap per routine in `/app/routines`.
- **Reminder:** attached to a task (at due, 10 min, 1 h, 1 day before, or custom), to a routine, or standalone ("Drink water, daily 11:00"). Kind: one-off or daily with weekdays. Channels: in-app, push, email (defaults in Settings, override per reminder).
- **Push actions:** "Done" and "Snooze 1 h" buttons where the platform supports notification actions; tapping opens the task.
- **Daily digest email** (optional): at a chosen local time, today's routines, due tasks and goals near deadline.
- **Not in Google Calendar:** routines and reminders are created, scheduled and delivered only by Planzz; they never sync to or from Google. Google Calendar is used only for the calendar views (see Key flows).

**AI chat** (right dock, ⌘J)

- Bring your own key: the user pastes an Anthropic API key in Settings. The key is stored only in that browser and calls go browser → Anthropic directly; Planzz servers never see it.
- Context: the current view (board filters, open axis, open task or doc) is attached to each message as a compact JSON summary.
- Tools the model can call, executed in the browser through supabase-js under RLS: `list_tasks`, `get_task`, `search` (tasks + docs), `create_task`, `update_task` (status, axis, category, due, priority), `create_note` (markdown doc), `list_routines`, `list_goals`, `get_calendar(range)`.
- Every write tool renders a confirmation card ("Create 3 tasks in Study → Física II?") and runs only on Accept.
- Threads are saved to the database (per user, optional per axis) so history follows the account across devices; the key does not.
- Suggested prompts: "Plan my day", "What's stuck in Waiting?", "Break this task into subtasks", "Summarize this doc".

**Guest mode** — identical to Things: Supabase anonymous sign-in with Turnstile, upgrade to email OTP or Google keeping the same user id, 25 MB file quota, 30-day inactivity cleanup. Guests get in-app and push reminders and AI (BYOK); email reminders and Google Calendar require an account.

**Motion** (Things spec applies; additions)

| Moment | Animation | Timing |
| --- | --- | --- |
| Task moves to a done status | Check mark draws, card desaturates to Done styling | Spring 380/30, 300ms |
| Zoom level change | Cards `layout`-animate to new size; extra fields fade | 220ms ease-out |
| Cell drag-over | Cell background to `--color-cell-over`, 1px aurora border fades in | 150ms |
| Column filter change | Filtered-out cards collapse + fade, remaining reflow | 250ms |
| Routine checked | Counter bumps (scale 1→1.15→1), streak flame tint | Spring |
| Goal progress update | Bar width animates | 400ms ease-out |

Rule kept from Things: during an active dnd-kit drag, no Motion `layout` animations; React Flow owns the canvas; everything respects `prefers-reduced-motion`.

**Keyboard shortcuts**

| Key | Action |
| --- | --- |
| ⌘K | Command palette (search, new task, go to axis, actions) |
| N | New task (in the focused cell, else quick add) |
| / | Focus search |
| ⌘J | Toggle AI chat |
| Arrows / H J K L | Move focus between cards and cells |
| Enter | Open task drawer |
| ⌘← / ⌘→ | Move focused task to previous / next status |
| ⌘↑ / ⌘↓ | Move focused task to previous / next axis |
| X | Mark done |
| D | Set due date |
| ⌫ | Move to Trash |
| ⌘− / ⌘+ / Shift+1 | Zoom out / in / fit |
| G then B / T / C | Go to Board / Today / Calendar |
| 1–8 | Open axis workspace by order |

## Architecture

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

## Data model

Every table carries `user_id` with RLS, and every cross-table foreign key includes `user_id`, so a row can never point at another user's axis, status or category even with a guessed UUID. Text search and unaccent setup are copied from Things.

**Structure: axes, statuses, categories, tasks**

```sql
-- extensions + f_unaccent(): same as Things
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_cron;
create extension if not exists pg_net;

create table profiles (
  user_id uuid primary key references auth.users on delete cascade,
  timezone text not null default 'UTC',          -- IANA, set from the browser on first load
  default_channels text[] not null default '{inapp,push}',
  auto_archive_days int not null default 14,
  created_at timestamptz not null default now()
);

create table axes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  emoji text,
  color text not null,                   -- aurora token name
  canvas_viewport jsonb,                 -- {x, y, zoom}
  position text collate "C" not null,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create table statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  is_done boolean not null default false,
  position text collate "C" not null,
  unique (id, user_id)
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid not null,
  name text not null,
  color text,
  position text collate "C" not null,
  unique (id, axis_id, user_id),
  foreign key (axis_id, user_id) references axes (id, user_id) on delete cascade
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid not null,
  title text not null,
  description text,
  target_date date,
  progress_mode text not null default 'tasks' check (progress_mode in ('tasks','numeric')),
  current_value numeric, target_value numeric, unit text,
  achieved_at timestamptz, archived_at timestamptz,
  position text collate "C" not null,
  created_at timestamptz not null default now(),
  unique (id, axis_id, user_id),
  foreign key (axis_id, user_id) references axes (id, user_id) on delete cascade
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid not null,
  category_id uuid,                      -- null = Uncategorized
  status_id uuid not null,
  goal_id uuid,
  title text not null,
  notes text,                            -- markdown
  priority smallint not null default 0 check (priority between 0 and 3),
  due_date date,                         -- local date in profiles.timezone
  due_time time,                         -- null = all-day
  block_start timestamptz,               -- optional time block
  block_end timestamptz,
  position text collate "C" not null,    -- fractional index, one order for main + inner
  completed_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  gcal_event_id text,                    -- set by the Google outbox worker
  gcal_calendar_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('simple', f_unaccent(coalesce(title,''))), 'A') ||
    setweight(to_tsvector('simple', f_unaccent(coalesce(notes,''))), 'C')
  ) stored,
  check (block_end is null or block_end > block_start),
  foreign key (axis_id, user_id) references axes (id, user_id) on delete restrict,
  foreign key (status_id, user_id) references statuses (id, user_id) on delete restrict,
  -- category must belong to the same axis; deleting a category only nulls category_id (PG15+)
  foreign key (category_id, axis_id, user_id) references categories (id, axis_id, user_id)
    on delete set null (category_id),
  foreign key (goal_id, axis_id, user_id) references goals (id, axis_id, user_id)
    on delete set null (goal_id)
);

create table subtasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  task_id uuid not null references tasks on delete cascade,
  title text not null,
  done boolean not null default false,
  position text collate "C" not null
);

create index tasks_board on tasks (user_id, axis_id, status_id, position)
  where deleted_at is null and archived_at is null;
create index tasks_due on tasks (user_id, due_date) where deleted_at is null and completed_at is null;
create index tasks_block on tasks (user_id, block_start) where block_start is not null;
create index tasks_search on tasks using gin (search);
create index tasks_title_trgm on tasks using gin (title extensions.gin_trgm_ops);
```

**Workspace content: resources, docs, canvas**

```sql
create table resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid not null,
  category_id uuid,
  kind text not null check (kind in ('link','file','doc')),  -- Resources tab = link; Docs tab = file + doc
  title text,
  note text,
  body text,                             -- markdown, kind = 'doc' only
  url text, domain text, site_name text, favicon_url text, image_url text,
  file_path text,                        -- storage: {user_id}/{resource_id}/{file_name}
  file_name text, mime_type text, file_size bigint, thumbnail_path text,
  enrich_status text not null default 'pending' check (enrich_status in ('pending','done','failed')),
  position text collate "C" not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('simple', f_unaccent(coalesce(title,'') || ' ' || coalesce(file_name,''))), 'A') ||
    setweight(to_tsvector('simple', f_unaccent(coalesce(note,'') || ' ' || coalesce(body,''))), 'C')
  ) stored,
  foreign key (axis_id, user_id) references axes (id, user_id) on delete cascade,
  foreign key (category_id, axis_id, user_id) references categories (id, axis_id, user_id)
    on delete set null (category_id)
);

create table task_resources (
  task_id uuid not null references tasks on delete cascade,
  resource_id uuid not null references resources on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  primary key (task_id, resource_id)
);

create table canvas_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid not null,
  kind text not null check (kind in ('note','text','image','link','task_ref','resource_ref')),
  content jsonb not null default '{}',   -- text, color, image path, url...
  ref_id uuid,                           -- task or resource id for *_ref kinds
  x real not null, y real not null, w real not null, h real not null,
  z int not null default 0,
  updated_at timestamptz not null default now(),
  foreign key (axis_id, user_id) references axes (id, user_id) on delete cascade
);
-- save_canvas_layout(layout jsonb): same RPC as Things, targeting canvas_nodes
```

**Routines, reminders, notifications**

```sql
create table routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid references axes on delete set null,
  title text not null,
  weekdays smallint[] not null default '{1,2,3,4,5,6,7}',  -- ISO, 1 = Monday
  time_of_day time,                      -- shown in Today's timeline when set
  active boolean not null default true,
  position text collate "C" not null,
  created_at timestamptz not null default now()
);

create table routine_logs (
  routine_id uuid not null references routines on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  local_date date not null,
  done_at timestamptz not null default now(),
  primary key (routine_id, local_date)
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  purpose text not null default 'item' check (purpose in ('item','digest')),
  task_id uuid references tasks on delete cascade,
  routine_id uuid references routines on delete cascade,
  title text,                            -- standalone reminders
  kind text not null check (kind in ('once','daily')),
  fire_at timestamptz,                   -- kind = once, absolute
  offset_minutes int,                    -- kind = once, relative to the task's due (e.g. -60)
  time_of_day time,                      -- kind = daily
  weekdays smallint[] not null default '{1,2,3,4,5,6,7}',
  channels text[] not null default '{inapp,push}',
  next_fire_at timestamptz,              -- computed in TS (lib/schedule/next-fire.ts)
  locked_until timestamptz,
  last_fired_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (channels <@ array['inapp','push','email'])
);
create index reminders_due on reminders (next_fire_at) where active;

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  device_label text,
  created_at timestamptz not null default now(),
  last_ok_at timestamptz
);

create table notifications (                 -- in-app inbox + send log + idempotency
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  reminder_id uuid references reminders on delete set null,
  fire_slot timestamptz not null,            -- the next_fire_at that produced it
  title text not null,
  body text,
  url text,
  channels_sent text[] not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (reminder_id, fire_slot)
);

create table notification_actions (           -- one-time tokens for Done / Snooze from push or email
  token text primary key,                    -- 32 random bytes, base64url
  user_id uuid not null references auth.users on delete cascade,
  reminder_id uuid references reminders on delete cascade,
  task_id uuid references tasks on delete cascade,
  action text not null check (action in ('done','snooze_1h','snooze_tomorrow')),
  expires_at timestamptz not null,
  used_at timestamptz
);
-- consume_notification_action(token text): security definer RPC callable by anon;
-- validates expiry + used_at, applies the action for that user only, marks used. No service-role key in Next.
```

The daily email digest is a reminder row with `purpose = 'digest'`, `kind = 'daily'` and `channels = '{email}'`, so it rides the same dispatcher and respects the user's timezone.

**Google Calendar**

```sql
create table google_accounts (
  user_id uuid primary key references auth.users on delete cascade,
  google_email text not null,
  refresh_token_secret_id uuid not null,     -- vault.secrets id; never selectable by the client
  scopes text[] not null,
  status text not null default 'ok' check (status in ('ok','revoked','error')),
  connected_at timestamptz not null default now()
);

create table calendar_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  google_calendar_id text not null,
  axis_id uuid references axes on delete cascade,  -- null = show in global calendar only
  push boolean not null default false,             -- Planzz items written here
  show_events boolean not null default true,
  color text
);
create unique index one_push_calendar_per_axis on calendar_links (axis_id) where push;

create table gcal_outbox (
  id bigserial primary key,
  user_id uuid not null references auth.users on delete cascade,
  task_id uuid not null,
  op text not null check (op in ('upsert','delete')),
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
-- trigger on tasks: after insert/update of title, due_date, due_time, block_start, block_end,
-- axis_id, status_id, deleted_at -> enqueue 'upsert' (or 'delete' when deleted/undated)
-- only if the task's axis has a push calendar link.
```

**AI history**

```sql
create table ai_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  axis_id uuid references axes on delete set null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references ai_threads on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  role text not null check (role in ('user','assistant','tool')),
  content jsonb not null,                    -- provider-neutral blocks incl. tool calls/results
  created_at timestamptz not null default now()
);
```

**RLS, storage, seeding**

- RLS on every table with the Things policy: `for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))`. `google_accounts`: select only (no client writes); `notification_actions`: no client policies at all (RPC only).
- Storage: private bucket `planzz`, path `{user_id}/{resource_id}/{file}`, same `storage.foldername` policies as Things; signed URLs (1 h) batched per list.
- Guest quota trigger on `resources` (25 MB total, 10 MB per file for `is_anonymous` users), copied from Things.
- `handle_new_user()` trigger (security definer) on `auth.users` insert: creates the profile, axes Work / Study / Other (blue, violet, olive) and statuses To do / Doing / Waiting / Done (`is_done`).
- RPCs (security invoker): `search_all(q, lim)` over tasks + resources, `move_tasks(ids uuid[], axis_id, status_id, category_id, positions text[])` for multi-moves in one call, `goal_progress` view, `matrix_counts` view grouped by axis × status × category for headers.
- Dispatcher-only RPCs (called with the service role from `/api/cron/dispatch`): `claim_due_reminders(lim int)` sets `locked_until = now() + interval '2 min'` on due, unlocked rows and returns them with the user's timezone; `claim_outbox(lim int)` same pattern.

**Scheduled jobs (`pg_cron`)**

```sql
-- every minute, only call Vercel when there is work
select cron.schedule('planzz-dispatch', '* * * * *', $$
  select net.http_post(
    url := 'https://<app-domain>/api/cron/dispatch',
    headers := jsonb_build_object('Authorization', 'Bearer ' ||
      (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret'))
  )
  where exists (select 1 from reminders where active and next_fire_at <= now())
     or exists (select 1 from gcal_outbox where processed_at is null and attempts < 5)
$$);

-- daily at 06:00 UTC: guest cleanup, trash purge, auto-archive, expired action tokens
select cron.schedule('planzz-daily', '0 6 * * *', $$ ... same pattern to /api/cron/daily ... $$);
```

## Key flows

All user mutations follow the Things pattern: optimistic cache patch in TanStack Query, rollback + toast on error, invalidate counts on settle, Undo toast for destructive actions. The flows below are the ones that are new in Planzz.

**Moving tasks in a matrix** (`lib/matrix/move.ts`, pure, unit-tested)

1. dnd-kit reports source and target cell plus the neighbor cards at the drop index. Cell ids encode their coordinates: `main:<axisId>:<statusId>` or `inner:<axisId>:<categoryId|none>:<statusId>`.
2. `move.ts` turns that into a patch: new `position` via `generateKeyBetween(prev, next)` (multi-select: `generateNKeysBetween`), plus `status_id`, `axis_id`, `category_id` per the moves table in Core concepts, plus `completed_at = now()` when entering an `is_done` status (null when leaving).
3. Single task: one `update` under RLS. Several tasks: one `move_tasks` RPC call.
4. In the main matrix with category filters active, the neighbors used for the key are the visible ones; the key still sorts correctly among hidden siblings.
5. Edge: a cross-axis move nulls `category_id`, `goal_id` and reruns the Google outbox trigger (the event may move to a different calendar).

**Pan and zoom on the board** (`MatrixViewport`)

- The viewport is a `overflow: auto` container; zoom level lives in Zustand and sets CSS variables (`--col-w`, card density). No `transform: scale`, so dnd-kit's rect measurements stay correct.
- Pinch (trackpad `wheel` with `ctrlKey`, touch gestures) is debounced into discrete level steps; the cell under the pointer is kept under the pointer after the step by adjusting `scrollLeft/Top`.
- Drag-to-pan starts only on gutters and headers' empty space, never on cards (dnd-kit owns those).

**Reminders: create → fire → reschedule**

1. The client computes `next_fire_at` with `lib/schedule/next-fire.ts` (pure, timezone-aware, unit-tested incl. DST changes in `America/New_York` and `Europe/Madrid`, and Argentina which has no DST) and saves the reminder. Changing a task's due date recomputes its relative reminders in the same mutation.
2. `pg_cron` calls `/api/cron/dispatch` (bearer `CRON_SECRET`) only when something is due.
3. The dispatcher calls `claim_due_reminders(100)`, then for each row: re-reads the linked task or routine (skip and deactivate if done, deleted, or the routine is already logged today), inserts a `notifications` row (the unique `(reminder_id, fire_slot)` makes retries idempotent), sends push to every subscription of the user (deleting endpoints that answer 404/410), sends email through the Brevo API if the channel is on and the user is not anonymous, then writes `last_fired_at` and the new `next_fire_at` (daily) or `active = false` (once).
4. Push payload: title, body, `url` (`/app?task=<id>`), and two action tokens (`done`, `snooze_1h`) created in `notification_actions` with a 48 h expiry. The service worker calls `/n/<token>`, which runs `consume_notification_action` and closes; on platforms without action buttons the notification click opens the task.
5. Timezone: on each app load, if `Intl.DateTimeFormat().resolvedOptions().timeZone` differs from `profiles.timezone`, show a one-line prompt; accepting recomputes every daily reminder's `next_fire_at`.

**Web push setup**

- VAPID keys in env (`VAPID_PUBLIC_KEY` exposed, `VAPID_PRIVATE_KEY` server-only). Permission is requested only from a user gesture (Settings → Notifications → "Enable on this device", or the first time a reminder is created).
- iOS/iPadOS: Web Push works only when Planzz is installed to the Home Screen (iOS 16.4+). Detect `navigator.standalone`/display-mode and show install instructions instead of the permission button.
- Each device is one `push_subscriptions` row with an editable label; Settings lists devices with "Send test" and "Remove".

**Google Calendar**

1. **Connect** (Settings → Integrations, account users only): `/api/google/connect` starts a dedicated OAuth flow (separate from Google sign-in, because Supabase does not persist provider refresh tokens) with `access_type=offline` and `prompt=consent`. Request the narrowest scopes that allow listing calendars, reading events, creating a Planzz calendar and writing its events; Claude Code checks Google's current scope list before choosing (candidates: `calendar.app.created` + `calendar.calendarlist.readonly` + `calendar.events.readonly`, else full `calendar`).
2. **Callback** stores the refresh token in Supabase Vault and its secret id in `google_accounts`. Vault read/write happens through security definer functions granted to `service_role` only, so `/api/google/*` uses the service role key (server-only), always scoped to the user id from the verified session.
3. **Linking:** for each axis the user picks "Create 'Planzz · Work' calendar" (default) or an existing calendar as its push target, and any calendars to show. Stored in `calendar_links`.
4. **Push (Planzz → Google):** the `gcal_outbox` trigger enqueues changes; the dispatcher drains it. Mapping: time block → timed event; due date + time → 30-minute event at that time; due date only → all-day event; done → title prefixed with "✓ "; deleted or undated → event deleted. Each event stores `extendedProperties.private.planzzTaskId` and a link back to the task. Failures retry up to 5 times with backoff, then surface as a badge in Settings.
5. **Read (Google → Planzz):** calendars render Google events for the visible range from `/api/google/events` (cached 5 min in TanStack Query), read-only, with "Open in Google" and "Make a task" (creates a task with that time block in the linked axis).
6. **Conflicts:** v1 is one-way for Planzz-owned events; edits made in Google to those events are overwritten on the next push. Documented in the UI. Two-way sync (sync tokens + push channels) is v2.
7. Token revoked or expired → `status = 'revoked'`, outbox paused, banner "Reconnect Google Calendar".

**AI chat (BYOK)**

1. Settings → AI: the user pastes an Anthropic API key; Planzz validates it with a minimal request and stores it in `localStorage` on that device only (option: "Don't remember" keeps it in memory for the session). Model picker defaults to the current Haiku model; Sonnet available.
2. Each send builds: system prompt (role, today's date and timezone, rules: never write without the confirm step) + a compact context JSON (current view, axes/statuses/categories names and ids, up to 50 relevant task titles) + thread history (last 20 messages).
3. Streaming loop in the browser with `@anthropic-ai/sdk`: read tools run immediately via supabase-js; write tools render a confirm card and wait; results return as `tool_result`; max 8 tool rounds per turn.
4. Messages persist to `ai_threads` / `ai_messages`. The key is never written to the database or sent to Planzz routes.
5. Errors: 401 → "Key rejected, check Settings"; 429/529 → retry with backoff, then a toast; network off → disabled input.
6. Security: a strict CSP (no inline scripts, `connect-src` limited to Supabase, Anthropic and the app) reduces XSS risk to the stored key; the HTML doc viewer is sandboxed without same-origin so uploaded HTML can never read it.

**Documents**

- Upload: same pipeline as Things files (row first, direct upload to Storage with the user JWT, TUS above 6 MB, client thumbnails), into `resources` with `kind = 'file'`.
- In-app markdown doc: `kind = 'doc'`, `body` edited with Tiptap, autosaved with a 1 s debounce.
- Viewing HTML: fetch the file text through a signed URL (cap 2 MB), render with `<iframe sandbox="allow-scripts" srcdoc>`; links open in a new tab via `allow-popups` only if the user toggles "Allow links".
- Viewing `.docx`: `mammoth` → HTML → `rehype-sanitize` → rendered in the app (no iframe needed).

**Routines**

- Checking a routine inserts `routine_logs (routine_id, local_date)` with the date in the user's timezone; unchecking deletes it. Streaks are computed client-side from the last 90 days of logs (`lib/schedule/streaks.ts`), skipping weekdays not in the routine's schedule.
- A routine reminder is skipped by the dispatcher when that day's log already exists.

## Build phases for Claude Code

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
    - Key settings + validation, ChatDock, streaming loop, tool schemas and executors, confirm cards, thread persistence, context builder, CSP.
    - **Done when:** "Create 3 study tasks for Física II this week" proposes 3 tasks, creates them only after Accept, and they appear in the matrix; the key never appears in any network request to the app's own domain or in the database.
11. **Phase 10 — Search, palette, polish, release**
    - `search_all` RPC, search field, ⌘K with tasks/docs/actions/navigation, every shortcut.
    - Motion pass, mobile layout (board scrolls horizontally per axis, dock becomes bottom sheet), a11y audit, error boundaries, production deploy.
    - **Done when:** "cancion" finds "Canción"; axe shows no critical issues; 60 fps dragging on a 500-task board; production deploy and `pg_cron` jobs point at the production URL.

## Model routing in Claude Code

The main session runs on Opus and only orchestrates; implementation goes to a Sonnet subagent and cheap, high-volume work to Haiku subagents. This keeps the expensive model on decisions and review.

| Role | Model | Does | Never does |
| --- | --- | --- | --- |
| Orchestrator (main session) | Opus | Reads the plan, writes the phase plan, analyzes trade-offs, reviews every diff against the plan and the done gate, decides fixes | Write feature code beyond trivial one-liners |
| `researcher` subagent | Haiku | Checks current docs and APIs (the "verify before using" list), fetches data, reads large codebases or logs and returns summaries | Edit files |
| `tester` subagent | Haiku | Writes and runs unit, SQL and e2e tests, long mechanical tasks (seed data, fixtures, type regeneration, renames), reports failures with file and line | Change product code to make tests pass |
| `implementer` subagent | Sonnet | Implements the tasks of the phase plan and the fixes Opus lists, one task per run, then runs typecheck + lint | Change the architecture, schema or plan; it escalates instead |

**Loop per phase**

1. Opus reads `CLAUDE.md` and the phase section; sends `researcher` to verify the APIs that phase touches.
2. Opus writes `docs/phases/phase-N.md`: ordered tasks, files, acceptance checks for each.
3. `implementer` (Sonnet) executes the tasks in order.
4. `tester` (Haiku) writes and runs tests for what changed and reports.
5. Opus reviews the diff and test report against the plan; any problem becomes a numbered fix list for `implementer`. Repeat 3–5 until the done gate passes.
6. Opus writes the CHANGELOG entry and the phase summary.

**Subagent files** (`.claude/agents/`; Claude Code should confirm the frontmatter fields against its current docs)

```markdown
<!-- .claude/agents/researcher.md -->
---
name: researcher
description: Verify library/API docs, fetch data, summarize large files or logs. Read-only.
model: haiku
tools: Read, Grep, Glob, WebSearch, WebFetch
---
Return short findings with sources and exact versions. Flag anything uncertain. Never edit files.

<!-- .claude/agents/tester.md -->
---
name: tester
description: Write and run tests (Vitest, SQL, Playwright) and long mechanical tasks.
model: haiku
tools: Read, Grep, Glob, Edit, Write, Bash
---
Only touch test files, fixtures, seeds and generated types. Report failures as file:line + cause.
Never change product code to make a test pass.

<!-- .claude/agents/implementer.md -->
---
name: implementer
description: Implement tasks from docs/phases/phase-N.md and fix lists from the orchestrator.
model: sonnet
tools: Read, Grep, Glob, Edit, Write, Bash
---
Do one task at a time, follow CLAUDE.md rules, run pnpm typecheck and pnpm lint before finishing.
If a task needs a schema, architecture or plan change, stop and report instead of improvising.
```

## CLAUDE.md draft

Drop this at the repo root before Phase 0, with this plan exported to `docs/plan.md`.

```markdown
# Planzz

Personal life planner. Home = matrix of axes (columns: Work, Study, Other) x statuses
(rows: To do, Doing, Waiting, Done), all user-editable. Each axis has a workspace:
inner matrix (categories x statuses), calendar, free canvas, docs, resources, goals.
Plus routines, reminders (in-app, push, email), Google Calendar, BYOK AI chat.
Full plan: docs/plan.md.

## Stack
Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4 (@theme tokens) · shadcn/ui
motion · dnd-kit (matrices, sidebar) · React Flow @xyflow/react (axis canvas only)
FullCalendar v6 standard · Tiptap · TanStack Query v5 · Zustand · date-fns-tz · chrono-node
Supabase (@supabase/ssr, Postgres + RLS, Storage, Vault, pg_cron, pg_net)
web-push (VAPID) · Brevo · Google Calendar API · @anthropic-ai/sdk (browser, BYOK) · Vercel

## Rules
- No separate backend. Browser -> Supabase under RLS for CRUD. Browser -> Anthropic for AI.
  Route handlers only: /api/unfurl, /api/google/*, /api/cron/*, /auth/callback, /n/[token].
- Service-role key only in /api/cron/* and /api/google/* (server-only; google routes always
  scope to the user id from the verified session). Never in client code, never logged.
- The user's Anthropic key lives only in the browser. Never send it to our routes or store it in the DB.
- Every table has user_id + RLS; every cross-table FK includes user_id. New migration = new file; regenerate types.
- Task position: one fractional index used by both matrices. All move logic goes through lib/matrix/move.ts.
- No transform: scale on the board. Zoom = semantic density levels; pan = native scroll.
- dnd-kit only in matrices/sidebar; React Flow only on the axis canvas; never mix. No Motion layout during drags.
- Scheduling math only in lib/schedule/* (pure, tz-aware, tested). Store instants as timestamptz,
  due dates as local date + time + profiles.timezone.
- Google Calendar is calendar-only: push dated tasks, read events. Routines and reminders never sync to Google.
- AI write tools always require an explicit Accept in the UI.
- Uploaded HTML renders only in <iframe sandbox="allow-scripts" srcdoc> (no allow-same-origin).
- Colors, radii, fonts only via tokens; no raw hex in components. Respect prefers-reduced-motion.
- Server state in TanStack Query with optimistic updates + rollback; UI-only state in Zustand.
- UI copy in English, sentence case.
- Verify current docs before using: Next 16 proxy.ts, supabase-js auth linking, FullCalendar React,
  Anthropic SDK browser flag + model ids, web-push, Google OAuth scopes and verification.

## Model routing
- Main session = Opus: orchestration, phase plans, analysis, review. No feature code.
- researcher (Haiku): docs/API verification, data fetching, summaries. Read-only.
- tester (Haiku): tests, long mechanical tasks. Never edits product code to pass tests.
- implementer (Sonnet): implements phase-plan tasks and Opus's fix lists; escalates design changes.
- Loop: plan (Opus) -> implement (Sonnet) -> test (Haiku) -> review (Opus) -> fixes -> done gate.

## Commands
pnpm dev · pnpm typecheck · pnpm lint · pnpm test · pnpm e2e
supabase start · supabase db reset · supabase gen types typescript --local > src/types/database.types.ts

## Env
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
CRON_SECRET, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT,
BREVO_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_TURNSTILE_SITE_KEY

## Definition of done (every phase)
typecheck + lint + tests green · no console errors · styleguide renders · CHANGELOG.md entry
```

## Costs and limits

v1 runs at $0 for one person; AI is paid by each user's own key. Figures are approximate, from memory of current plans; verify on the pricing pages before relying on them.

| Service | Free tier (approx.) | Impact on Planzz |
| --- | --- | --- |
| Supabase Free | 500 MB DB, 1 GB storage, 50 MB max file; pauses after about a week idle; `pg_cron`, `pg_net`, Vault included | Storage is the first ceiling. A paused project also stops reminders. Pro is about US$25/month |
| Vercel Hobby | Non-commercial; daily cron only; about 4.5 MB function body | Per-minute work runs from `pg_cron`; uploads bypass functions |
| Brevo | 300 emails/day | Reminder emails + one digest per user per day; fine for personal use |
| Web Push | Free (browser push services) | No vendor needed |
| Google Calendar API | Free within generous per-project quotas | Unverified apps with sensitive scopes show a warning and cap at 100 users; fine for personal use |
| Anthropic API | Paid per token by the user (BYOK) | $0 to the owner |
| FullCalendar standard, React Flow, Tiptap core | MIT | React Flow attribution link stays by default |

## Risks

| Risk | Mitigation |
| --- | --- |
| Zoom via CSS transforms breaks dnd-kit hit-testing | Semantic zoom levels + native scroll, no `transform: scale` on the board |
| Supabase Free project pauses, so reminders stop | Daily use keeps it awake; document it; Pro removes pausing |
| iOS push only works for installed PWAs | Detect and guide installation; email channel as fallback |
| Google OAuth in "Testing" mode expires refresh tokens after about 7 days | Publish the OAuth app "In production" (unverified warning, 100-user cap) before relying on sync |
| Duplicate or missed reminders (retries, DST, timezone changes) | Idempotent `notifications` unique key, row locks with `locked_until`, pure tested `next-fire.ts`, recompute on timezone change |
| BYOK key in `localStorage` exposed to XSS | Strict CSP, sanitized markdown/docx, sandboxed HTML viewer, "don't remember" option |
| AI model writes wrong data | Confirm card on every write tool; Undo toast after accept |
| Uploaded HTML runs scripts | `sandbox="allow-scripts"` without same-origin via `srcdoc`; never served from the app origin |
| Google edits to Planzz events lost on next push | One-way contract shown in the UI; two-way sync in v2 |
| Main matrix gets dense with many axes or tasks | Max 8 axes / 6 statuses, Overview level, Done collapsed, auto-archive after 14 days |

## Decisions

Confirmed on 2026-10-14 unless marked as an assumption.

| Decision | Choice |
| --- | --- |
| Inner matrix | Own columns (categories per axis), rows shared with the main matrix (statuses are global) |
| Main matrix filter | Category chips per column, in place, persisted in the URL |
| "Restricted canvas" | Pan + zoom with cards living inside cells as ordered lists; implemented as native scroll + 3 semantic zoom levels |
| AI | Chat with the user's own Anthropic key, browser-direct, tools with confirm-before-write |
| Reminder channels | In-app, web push (PWA), email; routines and reminders are set and fired only in Planzz |
| Google Calendar scope | Calendar only: tasks with a due date or time block are pushed one-way, Google events show read-only; routines and reminders never sync. Two-way is v2 |
| Auth, guests, visual language (assumption) | Same as Things: email OTP + Google, anonymous guests, Things design system with axis colors |
| UI language (assumption) | English only |
| Separate Supabase project from Things (assumption) | Yes; linking Things items as Planzz resources is a v2 idea |
