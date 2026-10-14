# Phase 6 — Calendar, Today, routines

**Goal:** per-axis and global calendars showing due tasks, time blocks, routines and goal deadlines with drag to reschedule; a Today view; routines with check-off, streaks and heatmaps; the profile timezone.

**Branch:** `phase-6-calendar-today` · **Read first:** CLAUDE.md · plan §Features (Axis workspace → Calendar, Today, Routines and reminders → Routine), §Key flows (Routines; Reminders step 5 for timezone) · README §4.14.

## Verify first (researcher)

- FullCalendar v6 with React 19 (`@fullcalendar/react`, daygrid, timegrid, list, interaction): peer deps, SSR (client-only import), theming via CSS variables, `eventDrop` / `eventResize` payloads.
- `date-fns-tz` v3: `toZonedTime`, `fromZonedTime`, `formatInTimeZone`.
- `Intl.DateTimeFormat().resolvedOptions().timeZone` coverage.

## Tasks

| # | Who | Task | Files | Acceptance |
| --- | --- | --- | --- | --- |
| 6.1 | I | Timezone: on app load compare browser timezone with `profiles.timezone`; first load sets it silently; a mismatch shows the one-line prompt; Settings → Notifications shows and edits it. `lib/schedule/time.ts`: local date/time ↔ instant helpers (pure) | `src/lib/schedule/time.ts`, `src/components/app-shell/timezone-prompt.tsx` | unit tests incl. Argentina (no DST) |
| 6.2 | I ∥ | `lib/schedule/streaks.ts`: current and best streak from logs + weekdays + today in tz, skipping unscheduled weekdays; heatmap cells for 12 weeks | `src/lib/schedule/streaks.ts` | table-driven tests: skipped weekdays, gaps, today not yet done, DST weeks |
| 6.3 | I | `lib/calendar/events.ts` (pure): tasks → all-day (due date) or timed (due time 30 min, block start–end) events, routines with `time_of_day` → recurring timed events on their weekdays, goal deadlines → all-day; axis color per event; reverse mapping from a drop/resize to a task patch | `src/lib/calendar/events.ts` | unit tests per mapping |
| 6.4 | I | `CalendarView` (FullCalendar wrapper, client-only, tokens via CSS vars): month/week/day/agenda; per-axis (workspace Calendar tab) and global (`/app/calendar`, axis toggles); drag to reschedule due, drag/resize blocks; click opens drawer; quick-create a block by selecting a range | `src/components/calendar/*`, `src/app/app/calendar/page.tsx`, workspace tab | dragging a block updates `block_start/end` |
| 6.5 | I | Routines: CRUD (title, optional axis, weekdays, time, active), reorder, check/uncheck for today (`routine_logs` with local date), counter bump + streak flame (spring), `/app/routines` with 12-week heatmap per routine (standalone reminders section stub for Phase 7) | `src/lib/routines/*`, `src/components/routines/*`, `src/app/app/routines/page.tsx` | — |
| 6.6 | I | Today (`/app/today`): routines due today checklist with streaks; tasks overdue + due today + blocked today grouped by axis; compact day timeline (blocks and timed routines); "Upcoming reminders" placeholder until Phase 7; empty state "Nothing pending. Breathe." with aurora | `src/app/app/today/page.tsx`, `src/components/today/*`, `src/lib/tasks/queries.ts` | — |
| 6.7 | T | Tests: Today selection with frozen clock across timezones (exactly overdue + due today + blocks today); week-view block drag e2e; streak tests; routine check e2e | `e2e/*`, `src/**/*.test.ts` | green |
| 6.8 | O | Gate + CHANGELOG | — | see Done when |

## Done when (plan)

- Dragging a block in week view updates `block_start/end`.
- Streaks are correct across skipped weekdays (unit tests).
- Today shows exactly overdue + due today + blocks today.

## Out of scope

Reminders and notifications (Phase 7), Google events (Phase 8), recurring tasks (v2).
