# Overview

> Part of the Planzz product spec. Index: [../plan.md](../plan.md)


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

