# Phase 0 — Scaffold and design system

**Goal:** an empty but production-shaped Next.js app with the Things design system, the Planzz tokens, a styleguide and a landing page, green in CI.

**Branch:** `phase-0-scaffold` · **Read first:** CLAUDE.md · plan §Visual language, §Architecture (Stack, Folder structure), §Build phases (Phase 0) · research-notes "Inherited from Things".

**Source to port:** Things repo (`maggioniduffy/things`, clone read-only into the scratchpad): config files at the root, `src/app/globals.css`, `src/components/brand/*`, `src/components/ui/*`, `src/app/styleguide/*`, `src/app/(marketing)/page.tsx`, `src/components/marketing/*`, `src/test/*`, `.github/workflows/ci.yml`.

## Verify first (researcher)

- Things' `package.json` versions are still the pins in research-notes; flag any package with a security advisory (`pnpm audit` digest).
- Nothing else: the stack facts are inherited.

## Decisions

- **Copy Things' scaffold instead of running create-next-app** (it refuses non-empty directories and Things' config is already tuned). Rename the package to `planzz`; drop dependencies Planzz does not need yet (they come back in the phase that uses them).
- Logo: wordmark + 2×2 matrix glyph placeholder (README §4.15).
- **Pin next + eslint-config-next to 16.4.1**, not Things' 16.4.0 (research, 2026-10-14: 16.4.1 fixes two critical RCEs and a Server Actions DoS). React stays 19.3.0 (19.3.1 has no security fixes). Accepted: `braces` ≤ 3.0.3 advisory GHSA-vfj7-8cjw-p6xm via eslint-config-next. It is lint-time only and has no patched release; recheck in Phase 10.

## Tasks

| # | Who | Task | Files | Acceptance |
| --- | --- | --- | --- | --- |
| 0.1 | I | Scaffold by porting Things' root config: `package.json` (name `planzz`, same scripts, Phase 0 deps only), `tsconfig.json`, `next.config.js`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `vitest.config.mts`, `playwright.config.ts`, `components.json`, `pnpm-workspace.yaml`, `.gitignore`, `.env.example` (Env list from CLAUDE.md), `.github/workflows/ci.yml` (typecheck, lint, unit; e2e job added in Phase 1). Minimal `src/app/layout.tsx` with Inter + Inter Tight via `next/font`. `CHANGELOG.md` already exists | root files, `src/app/layout.tsx`, `src/test/setup.ts`, `src/test/render.tsx` | `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm build` green |
| 0.2 | I | Tokens and brand: port `globals.css` (`@theme static`) and add the Planzz tokens from plan §Visual language (`--color-cell`, `--color-cell-over`, `--color-grid-dot`, `--color-done`, `--radius-cell`, `--size-row-header`). Port `<Grain />`, `<Aurora />`, `<AuroraGlow />`. New `<Logo />` (wordmark + matrix glyph, `color`/`mono` variants). `<DotGrid />` background. `lib/axis-colors.ts`: aurora token per axis, `nextAxisColor(used)` cycling through the remaining stops | `src/app/globals.css`, `src/components/brand/*`, `src/lib/axis-colors.ts`, `src/test/no-raw-hex.test.ts` | no-raw-hex test passes; `axis-colors` unit tests (cycle order, all six used); reduced motion stops aurora drift |
| 0.3 | I ∥ | UI primitives: port Things `components/ui/*` (Button, IconButton, Input, SearchField, Dialog, Drawer, DropdownMenu, ContextMenu, Tooltip with one app-level provider, Kbd, Badge, Sonner, Command, Skeleton, Separator) and add `SegmentedControl` (workspace tabs, zoom control) and `Chip` (category filters, toggleable, with color dot) | `src/components/ui/*` | each renders with tokens only; visible focus ring; Things' unit tests ported and green |
| 0.4 | I | `/styleguide` (404 in production): port Things sections; add a Planzz section with axis colors, matrix cell states (idle, hover aurora glow, drag-over), card densities (Overview / Default / Detail mock cards), Done styling, `SegmentedControl`, `Chip` | `src/app/styleguide/**` | every token and component visible; page loads without console errors |
| 0.5 | I | Landing `/`: aurora hero ("One screen to see your life"), the matrix glyph as illustration, "Try without an account" + "Sign in" (link to `/login`; guest wiring in Phase 1), short features section (matrix, workspaces, routines and reminders, calendar, AI), footer | `src/app/(marketing)/page.tsx`, `src/components/marketing/*` | renders at 375 px and 1440 px without horizontal scroll |
| 0.6 | T | Tests: Playwright smoke for `/` and `/styleguide`; reduced-motion e2e (`emulateMedia({ reducedMotion: 'reduce' })` → no running animations); unit tests for new primitives | `e2e/*.spec.ts`, `src/**/*.test.tsx` | `pnpm e2e` green |
| 0.7 | O | Gate: Lighthouse on `next build && next start` for `/`; review screenshots of `/` and `/styleguide`; CHANGELOG entry | — | see Done when |

## Done when (plan)

- `/styleguide` shows every token and component.
- Lighthouse performance ≥ 90 on `/`.
- Reduced motion disables drift.

## Out of scope

Supabase, auth, any `/app` route.
