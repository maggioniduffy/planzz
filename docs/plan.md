# Planzz — Product plan (index)

Oct 14, 2026 · @Faustino

The product spec is split by topic so a run loads only what it needs. Read the file a task names, not all of them.

| Plan section | File | Read when |
| --- | --- | --- |
| Overview | [spec/overview.md](spec/overview.md) | Orienting, scope, non-goals |
| Visual language | [spec/visual-language.md](spec/visual-language.md) | Tokens, motion, any UI work |
| Core concepts | [spec/core-concepts.md](spec/core-concepts.md) | Matrices, moves, rules |
| Features and UX | [spec/features.md](spec/features.md) | Building or changing a screen |
| Architecture | [spec/architecture.md](spec/architecture.md) | Stack, folders, route handlers |
| Data model | [spec/data-model.md](spec/data-model.md) | Migrations, RLS, RPCs |
| Key flows | [spec/key-flows.md](spec/key-flows.md) | Documents, reminders, Google, AI flows |
| MCP | [spec/mcp.md](spec/mcp.md) | Accessing Planzz data and features through MCP |
| Costs and limits · Risks · Decisions | [spec/costs-risks-decisions.md](spec/costs-risks-decisions.md) | Phase 10, risk checks |
| Build phases | [phases/index.md](phases/index.md) | Picking the next phase; "Done when" gates |

Execution (roles, loop, owner actions, status): [phases/README.md](phases/README.md). Verified API facts, which win over the spec: [research-notes.md](research-notes.md).

Removed as duplicates: "Model routing in Claude Code" (now `phases/README.md` §1 and `.claude/agents/`) and "CLAUDE.md draft" (now the root `CLAUDE.md`). Both remain in git history.
