# Costs, risks and decisions

> Part of the Planzz product spec. Index: [../plan.md](../plan.md)


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
| BYOK key in `localStorage` exposed to XSS | Sanitized markdown/docx/AI output, no raw HTML from users in the app document, sandboxed HTML viewer, "don't remember" option. No CSP (decided 2026-10-14 so uploaded HTML can run scripts) |
| AI model writes wrong data | Confirm card on every write tool; Undo toast after accept |
| Uploaded HTML runs scripts (wanted: interactive quizzes) | Sandboxed `srcdoc` iframe without same-origin: opaque origin, no access to cookies, storage or the parent page; never served from the app origin |
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
