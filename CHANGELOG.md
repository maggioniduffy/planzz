# Changelog

## Unreleased

### Phase 0 — Scaffold and design system

#### Added

- Next.js 16 app scaffolded from the Things config (TypeScript strict, Tailwind v4, ESLint, Prettier, Vitest, Playwright) with Phase 0 dependencies only; CI runs typecheck, lint + format check and unit tests.
- Design tokens ported from Things plus the Planzz tokens (`--color-cell`, `--color-cell-over`, `--color-grid-dot`, `--color-done`, `--radius-cell`, `--size-row-header`). Aurora stops keep Things' names (`--color-aurora-blue`, …), so the plan's `--aurora-blue` maps to `--color-aurora-blue`.
- Brand: `Grain`, `Aurora`, `AuroraGlow` (drift stops under reduced motion), new `Logo` (wordmark + 2×2 matrix glyph, `color`/`mono`), `LogoGlyph`, `DotGrid`, and a favicon from the glyph.
- `lib/axis-colors.ts`: aurora stop per axis (Work blue, Study violet, Other olive) and `nextAxisColor`.
- UI primitives ported from Things with one app-level `TooltipProvider`, plus `SegmentedControl` (radio semantics, arrow keys move the selection) and `Chip` (toggleable filter with color dot and count).
- `/styleguide` (404 in production unless `STYLEGUIDE=1`) with a Planzz section: axis colors, matrix cell states, card densities, Done styling, segmented controls and chips.
- Landing page `/`: aurora hero, matrix illustration, features and footer.
- Tests: unit tests for brand, primitives, axis colors and the no-raw-hex rule; Playwright smoke, styleguide interactions and reduced-motion checks.

#### Gate

- Lighthouse on `next build && next start`, `/`: performance 91 and 96 over two runs, accessibility 100, best practices 96, SEO 100.

### Planning

#### Added

- Product spec moved to `docs/plan.md` (architecture diagram drawn in place of the missing embed).
- `CLAUDE.md` from the plan's draft, with the Supabase key names updated to the publishable/secret format and links to the execution plan and research notes.
- Subagents in `.claude/agents/`: `researcher` (Haiku), `tester` (Haiku), `implementer` (Sonnet).
- Execution plan in `docs/phases/`: the loop, owner actions, spec-review decisions, status, and one file per phase (0–10) with ordered tasks, files and acceptance checks.
- `docs/research-notes.md`, seeded with the stack facts Things verified and a per-phase queue of APIs to verify.
