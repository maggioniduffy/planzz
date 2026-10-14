# Phase 7 — Reminders and notifications

**Goal:** reminders on tasks, routines and standalone, delivered in-app, by web push (incl. installed iPhone PWA) and by email, with Done/Snooze actions, a daily digest, and an idempotent per-minute dispatcher driven by `pg_cron`.

**Branch:** `phase-7-reminders` · **Read first:** CLAUDE.md · plan §Features (Routines and reminders), §Architecture (Route Handlers, Service worker), §Data model (Routines, reminders, notifications; Scheduled jobs), §Key flows (Reminders, Web push setup) · README §4.8, §4.9, §4.12, §4.13, §4.16, §4.23.

## Verify first (researcher)

- `web-push` current version: `sendNotification` options (TTL, urgency, topic), error codes for gone subscriptions, Node runtime on Vercel.
- iOS/iPadOS 16.4+ web push: Home Screen install requirement, `navigator.standalone` / `display-mode` detection, notification action buttons support (which platforms show `actions`).
- Brevo transactional email API: endpoint, auth header, payload, rate limits.
- `pg_net.http_post` signature on the current Supabase image; `pg_cron` job definitions in migrations; reading Vault secrets from a cron job.

## Owner actions

O4 (Brevo), O6 (VAPID in Vercel), O7 (cron secret + URL in cloud), O8 (iPhone) — needed for the gate, not for local work.

## Tasks

| # | Who | Task | Files | Acceptance |
| --- | --- | --- | --- | --- |
| 7.1 | I | `lib/schedule/next-fire.ts` (pure): next fire for once-absolute, once-relative (due date + time in tz + offset; all-day due → 09:00 local), daily with weekdays and `time_of_day`; returns null when nothing is left | `src/lib/schedule/next-fire.ts` | tests incl. DST forward/back in `America/New_York` and `Europe/Madrid`, `America/Argentina/Buenos_Aires`, weekday skips, leap day |
| 7.2 | I | Reminder mutations + `ReminderPicker`: in the task drawer (at due, 10 min, 1 h, 1 day before, custom; max 5), on routines, standalone in `/app/routines` ("Drink water, daily 11:00"); channels default from Settings with per-reminder override; due-date changes recompute relative reminders in the same mutation (README §4.9); timezone change recomputes daily reminders | `src/lib/reminders/*`, `src/components/task/reminder-picker.tsx`, `src/components/routines/*` | unit tests on recompute paths |
| 7.3 | I ∥ | In-app inbox: bell with unread count in the sidebar, list with mark read / mark all, click opens `url`; polling 60 s + on focus (README §4.12); Today "Upcoming reminders" section filled | `src/components/notifications/*`, `src/lib/notifications/*` | — |
| 7.4 | I | PWA and push: `public/manifest.webmanifest` + icons, `public/sw.js` (push → `showNotification` with actions when supported; `notificationclick` focuses/opens `/app?task=`; action click calls the consume RPC with the token), registration; Settings → Notifications: "Enable on this device" (user gesture only), iOS install guidance when not standalone, device list with label edit, "Send test" (README §4.13), remove | `public/*`, `src/lib/notify/register.ts`, `src/components/settings/notifications/*` | Playwright: subscription row created (permission granted via context) |
| 7.5 | I | Migration: `claim_due_reminders(lim)`, `consume_notification_action(token, action?)` (security definer, validates expiry/used, acts only for that user, marks used), expiry cleanup function; pgTAP | `supabase/migrations/*_dispatch.sql`, `supabase/tests/database/*` | `supabase test db` green |
| 7.6 | I | `/api/cron/dispatch`: bearer `CRON_SECRET`; claim 100; per row: re-read task/routine (skip + deactivate when done, deleted or routine logged today; reschedule when `due + offset` changed), insert `notifications` (unique slot), create action tokens (48 h), send push to every subscription (delete on 404/410, update `last_ok_at`), email via Brevo when on and not anonymous, set `last_fired_at` and next `next_fire_at` or `active = false`. Digest rows (`purpose = 'digest'`) render today's routines, due tasks, goals near deadline. Senders behind interfaces with fakes | `src/app/api/cron/dispatch/route.ts`, `src/lib/notify/{dispatch,push,email}.ts`, `src/lib/notify/templates/*` | route tests with fakes: two runs for one slot send once |
| 7.7 | I | `/n/[token]`: page showing the action with a confirm button that POSTs (never acts on GET, README §4.8), then closes or links to the task; email templates use it | `src/app/n/[token]/page.tsx` | e2e: GET alone does not consume |
| 7.8 | I | Daily digest toggle + local time in Settings (creates/updates the digest reminder row); `/api/cron/daily` adds guest cleanup (inactive 30 days, storage then `auth.admin.deleteUser`) and expired token purge | `src/components/settings/notifications/*`, `src/lib/cron/*` | route tests |
| 7.9 | I | `pg_cron` jobs: migration defines the jobs reading URL and secret from Vault (no secrets in git); `supabase/setup/cron.sql` documents the Vault inserts (O7); local dev script `pnpm cron:tick` calls the dispatcher every minute | `supabase/migrations/*_cron.sql`, `supabase/setup/cron.sql`, `scripts/cron-tick.mjs` | local tick fires a reminder |
| 7.10 | T | Tests: next-fire matrix; dispatcher idempotency, gone subscription cleanup, skip/deactivate rules, stale relative reminder; consume RPC; e2e: create reminder 2 min ahead → in-app notification appears via local tick | `src/**/*.test.ts`, `supabase/tests/database/*`, `e2e/*` | green |
| 7.11 | O | Gate: manual push on desktop Chrome and an installed iPhone PWA, email in an inbox, "Snooze 1h" from the notification; CHANGELOG | — | see Done when |

## Done when (plan)

- A reminder set for 2 minutes ahead arrives by push on desktop Chrome and on an installed iPhone PWA, and by email.
- "Snooze 1h" from the notification reschedules it.
- Running the dispatcher twice for the same slot sends once.

## Out of scope

SMS / Telegram (v2). Routines and reminders never sync to Google.
