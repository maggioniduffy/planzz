# Changelog

## Unreleased

### Phase 0 — Scaffold and design system

#### Added

- Next.js 16 scaffold ported from Things: TypeScript strict, ESLint flat config, Prettier, Vitest, Playwright, CI (typecheck, lint, format, unit, build). Phase 0 dependencies only.
- Design tokens from Things plus the Planzz board tokens (`--color-cell`, `--color-cell-over`, `--color-grid-dot`, `--color-done`, `--radius-cell`, `--size-row-header`).
- Brand: `<Grain />`, `<Aurora />`, `<AuroraGlow />` ported; new `<Logo />` (wordmark + 2×2 matrix glyph, color/mono) and `<DotGrid />`. Axis colors with `nextAxisColor()`.
- UI primitives ported from Things, plus `SegmentedControl` and `Chip`. App-level tooltip provider and toaster.
- `/styleguide` (404 in production unless `STYLEGUIDE=1`) with a Planzz section: axis colors, cell states, card densities, Done styling.
- Landing page `/`: aurora hero, matrix preview, features, footer.
- Tests: 77 unit, 20 e2e (smoke, no horizontal scroll at 375/1440 px, reduced motion stops aurora drift).

#### Changed

- `next` and `eslint-config-next` pinned to 16.4.1 (security release) instead of Things' 16.4.0.

#### Notes

- Lighthouse on `/` (production build, mobile): performance 92–95, accessibility 100, best practices 96, SEO 100. LCP ≈ 2.9 s (hero subhead).
- Landing `/login` links skip prefetch until Phase 1 adds the route.
- Known advisory: `braces` ≤ 3.0.3 via eslint-config-next (lint-time only, no fix released).

### Planning

#### Added

- Product spec moved to `docs/plan.md` (architecture diagram drawn in place of the missing embed).
- `CLAUDE.md` from the plan's draft, with the Supabase key names updated to the publishable/secret format and links to the execution plan and research notes.
- Subagents in `.claude/agents/`: `researcher` (Haiku), `tester` (Haiku), `implementer` (Sonnet).
- Execution plan in `docs/phases/`: the loop, owner actions, spec-review decisions, status, and one file per phase (0–10) with ordered tasks, files and acceptance checks.
- `docs/research-notes.md`, seeded with the stack facts Things verified and a per-phase queue of APIs to verify.
