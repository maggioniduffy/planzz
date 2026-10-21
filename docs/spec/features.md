# Features and UX

> Part of the Planzz product spec. Index: [../plan.md](../plan.md)


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
| `.html` | Interactive: scripts run, so self-contained apps such as a quiz made with Claude work. Sandboxed `<iframe srcdoc>` with `sandbox="allow-scripts allow-forms allow-modals"` and no `allow-same-origin`, so page scripts can never reach the app's cookies or storage |
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

