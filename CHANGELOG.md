# Changelog

## Unreleased

### Planning

#### Added

- Product spec moved to `docs/plan.md` (architecture diagram drawn in place of the missing embed).
- `CLAUDE.md` from the plan's draft, with the Supabase key names updated to the publishable/secret format and links to the execution plan and research notes.
- Subagents in `.claude/agents/`: `researcher` (Haiku), `tester` (Haiku), `implementer` (Sonnet).
- Execution plan in `docs/phases/`: the loop, owner actions, spec-review decisions, status, and one file per phase (0–10) with ordered tasks, files and acceptance checks.
- `docs/research-notes.md`, seeded with the stack facts Things verified and a per-phase queue of APIs to verify.
