# Phase 8 — Google Calendar

**Goal:** connect a Google account, link calendars to axes, push dated Planzz tasks one-way into Google, and show Google events read-only in Planzz calendars.

**Branch:** `phase-8-google-calendar` · **Read first:** CLAUDE.md · plan §Key flows (Google Calendar), §Data model (Google Calendar), §Architecture (Route Handlers, service-role rule) · README §4.21 · research-notes queue for Phase 8.

## Verify first (researcher)

- Narrowest scope set that allows: list calendars, read events, create a Planzz calendar, write its events (plan candidates `calendar.app.created` + `calendar.calendarlist.readonly` + `calendar.events.readonly`, else `calendar`). Which are "sensitive"; unverified-app limits; refresh-token lifetime in Testing vs. In production.
- Calendar v3: `events.insert/patch/delete`, `extendedProperties.private`, all-day vs. timed payloads, `calendars.insert`, `calendarList.list`, rate limits.
- `googleapis` package size vs. plain `fetch` (decide; default plain `fetch` with a small typed client).
- Supabase Vault: `vault.create_secret`, `vault.update_secret`, reading `vault.decrypted_secrets` from a security definer function granted to `service_role` only.

## Owner actions

O9 (Google Cloud project, consent screen In production, web client). Local work uses a fake Google server.

## Tasks

| # | Who | Task | Files | Acceptance |
| --- | --- | --- | --- | --- |
| 8.1 | I | Migration: Vault helper functions (`store_google_token(user_id, token)`, `get_google_token(user_id)`, `delete_google_token`) granted to `service_role` only; `gcal_outbox` trigger on `tasks` per the plan (enqueue only when the axis has a push link; `delete` when deleted or undated); `claim_outbox(lim)`; pgTAP (anon/authenticated cannot call the Vault functions; trigger cases) | `supabase/migrations/*_google.sql`, `supabase/tests/database/*` | `supabase test db` green |
| 8.2 | I | `lib/google/oauth.ts` + `/api/google/connect` (account users only; `state` bound to the session and stored in an httpOnly cookie; `access_type=offline`, `prompt=consent`) and `/api/google/callback` (verify state, exchange code, store token in Vault, upsert `google_accounts`) | `src/lib/google/oauth.ts`, `src/app/api/google/{connect,callback}/route.ts` | route tests: bad state rejected; guests rejected |
| 8.3 | I | `lib/google/calendar.ts` (typed client, base URL injectable for the fake), `/api/google/calendars` (list; create "Planzz · <Axis>"); Settings → Integrations: connect/disconnect, per-axis push target (create default or pick existing) and calendars to show (`calendar_links`), one-way contract note | `src/lib/google/calendar.ts`, `src/app/api/google/calendars/route.ts`, `src/components/settings/integrations/*` | — |
| 8.4 | I | Outbox worker in the dispatcher: `claim_outbox`, mapping (pure `lib/google/map-task.ts`: block → timed; due + time → 30 min; due only → all-day; done → "✓ " prefix; link back to the task; `planzzTaskId` private property), insert/patch/delete, store `gcal_event_id`/`gcal_calendar_id`, retries with backoff up to 5, then a Settings badge | `src/lib/google/outbox.ts`, `src/lib/google/map-task.ts`, `src/app/api/cron/dispatch/route.ts` | unit tests per mapping; cross-axis move moves the event to the other calendar |
| 8.5 | I | `/api/google/events?from&to&axisId`: read events of the shown calendars, scoped to the session user; calendars render them read-only (TanStack cache 5 min) with "Open in Google" and "Make a task" (task with that block in the linked axis) | `src/app/api/google/events/route.ts`, `src/components/calendar/*` | — |
| 8.6 | I | Revocation: `invalid_grant` → `status = 'revoked'`, outbox paused, banner "Reconnect Google Calendar"; disconnect deletes the Vault secret | `src/lib/google/*`, `src/components/app-shell/*` | route test with a fake `invalid_grant` |
| 8.7 | T | Fake Google server for tests (records calls); e2e: connect via fake, link axis, task with block → event created within one tick, reschedule → patched, done → "✓", delete → removed; events show read-only | `e2e/fakes/google.ts`, `e2e/*` | green |
| 8.8 | O | Gate with a real Google account (O9); CHANGELOG | — | see Done when |

## Done when (plan)

- A task with a time block appears in the linked Google calendar within 2 minutes, moves when rescheduled, gets "✓" when done and disappears when deleted.
- Google events show read-only in the axis calendar.

## Out of scope

Two-way sync (v2). Routines and reminders never sync.
