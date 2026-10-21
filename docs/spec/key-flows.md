# Key flows

> Part of the Planzz product spec. Index: [../plan.md](../plan.md)


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
6. Security: no Content-Security-Policy in v1 (a CSP would be inherited by the `srcdoc` iframe and stop the scripts in uploaded HTML). XSS risk to the stored key is kept down by sanitizing every rendered markdown/docx/AI message, never using `dangerouslySetInnerHTML` on user content, and the HTML doc viewer being sandboxed without same-origin, so uploaded HTML can never read the key.

**Documents**

- Upload: same pipeline as Things files (row first, direct upload to Storage with the user JWT, TUS above 6 MB, client thumbnails), into `resources` with `kind = 'file'`.
- In-app markdown doc: `kind = 'doc'`, `body` edited with Tiptap, autosaved with a 1 s debounce.
- Viewing HTML: fetch the file text through a signed URL (cap 2 MB), render with `<iframe sandbox="allow-scripts allow-forms allow-modals" srcdoc>` (scripts, forms and `alert`/`confirm` work; `localStorage` does not, because the frame has an opaque origin); links open in a new tab via `allow-popups` only if the user toggles "Allow links".
- Viewing `.docx`: `mammoth` → HTML → `rehype-sanitize` → rendered in the app (no iframe needed).

**Routines**

- Checking a routine inserts `routine_logs (routine_id, local_date)` with the date in the user's timezone; unchecking deletes it. Streaks are computed client-side from the last 90 days of logs (`lib/schedule/streaks.ts`), skipping weekdays not in the routine's schedule.
- A routine reminder is skipped by the dispatcher when that day's log already exists.

