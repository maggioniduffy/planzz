# Research notes

Verified facts that **override `docs/plan.md` and model memory** where they differ. Each phase's researcher run appends a section here; Opus reviews and dates it.

The first section is inherited from the Things project (`maggioniduffy/things`, `docs/research-notes.md`, checked 2026-10-12 against installed packages), because Planzz uses the same stack at the same versions. Re-verify an inherited fact only if a phase upgrades the package.

## Inherited from Things (2026-10-12)

### Pinned versions (Phase 0 installs these)

| Package | Version | Note |
| --- | --- | --- |
| next / eslint-config-next | 16.4.x | Node ≥ 22.19 (undici 8, pdfjs-dist 6.4) |
| react / react-dom | 19.3.x | |
| tailwindcss / @tailwindcss/turbopack | 4.x | `@theme` in `globals.css`; the scaffold wires Tailwind through `turbopack.rules`, not PostCSS |
| shadcn (CLI) | 4.21.x | `pnpm dlx shadcn@4.21 init -t next -b radix`; no `--base-color` flag |
| @supabase/supabase-js · @supabase/ssr | 2.117.x · 0.12.7 (exact) | |
| supabase (CLI, devDependency) | 2.120.x | run as `pnpm supabase …` |
| @xyflow/react | 12.12.x | not the 13.x `next` tag |
| motion | 14.1.x | import from `motion/react` only |
| @dnd-kit/core · sortable · utilities | 6.3 · 10.0 · 3.2 | not `@dnd-kit/react` (pre-1.0) |
| @tanstack/react-query | 5.104.x | |
| zustand | 5.0.x | |
| zod | 4.x | `z.uuid()`, `z.url()`, `z.email()` are top-level |
| fractional-indexing | 4.0.x | ESM-only; default base-62 alphabet only; `position` columns are `collate "C"` |
| cmdk 1.1 · sonner 2.0 · vaul 1.1 · lucide-react 1.55 | | |
| linkedom 0.18 · ipaddr.js 2.5 · undici 8.11 | | unfurl / SSRF guard |
| pdfjs-dist | 6.4.x | use the **legacy** build (`pdfjs-dist/legacy/build/pdf.mjs` + worker); the modern build throws in Chromium 141 |
| tus-js-client | 4.3.x | uploads > 6 MB |
| @marsidev/react-turnstile | 1.6.x | |
| vitest | 4.1.x | |
| @playwright/test | 1.64.x | |
| @testing-library/react + dom | 16.3 + 10.x | |
| @axe-core/playwright | 4.13.x | Phase 10 |

### Next.js 16

- `src/proxy.ts` replaces `middleware.ts`: named `proxy` export, static `config.matcher`, Node runtime only.
- Scaffold with `--no-cache-components`; `fetch` is not cached by default.
- `params`, `searchParams`, `cookies()`, `headers()` are Promises.
- `next lint` is gone: ESLint CLI with flat `eslint.config.mjs`. `next build` does not lint.
- create-next-app refuses non-empty directories: scaffold into a subdirectory and move files, or copy Things' config files directly (Phase 0 decision).
- Client components using `useSearchParams` must sit under `<Suspense>`.

### Supabase

- Key names: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`) and server-only `SUPABASE_SECRET_KEY` (`sb_secret_…`). The plan's `ANON_KEY` / `SERVICE_ROLE_KEY` names are replaced by these.
- `@supabase/ssr`: cookie adapter with `getAll` / `setAll(cookies, headers)` only. In the proxy call `auth.getClaims()` before building the response and copy cookies and headers onto it.
- Auth calls: `signInWithOtp({ email, options: { captchaToken } })`, `verifyOtp({ email, token, type: 'email' | 'email_change' })`, `signInAnonymously({ options: { captchaToken } })`, `updateUser({ email })`, `linkIdentity({ provider: 'google' })`. JWT carries `is_anonymous`.
- `config.toml`: `enable_anonymous_sign_ins = true`, `enable_manual_linking = true`, `double_confirm_changes = false` (guests have no old address), raise `[auth.rate_limit] email_sent` locally or OTP e2e throttles. Email templates use `{{ .Token }}`.
- Storage: `upload()` has no progress and ignores `contentType` for Blob bodies (wrap as `File`); resumable endpoint `${SUPABASE_URL}/storage/v1/upload/resumable` with tus, 6 MB chunks; `createSignedUrls(paths, s)` → `[{ path, signedUrl, error }]`.
- Guest quota: storage inserts run as `service_role`, so enforce with a `before insert or update` trigger on `storage.objects` reading `metadata->>'size'` and `owner_id`. Over-quota uploads return HTTP 500 `P0001`; map that to the quota toast.
- Thumbnails live at `{user_id}/{id}/.thumb.webp` (leading dot avoids collisions with user files).

### TanStack Query / Zustand

- `fetchQuery`/`prefetchQuery`/`ensureQueryData` are deprecated: use `queryClient.query(options)`. `isServer` → `environmentManager.isServer()`.
- SSR: per-request `QueryClient` → `dehydrate` → `<HydrationBoundary>`; set `staleTime` (30 s) on server and browser clients.
- Optimistic pattern: `onMutate` cancel → snapshot → `setQueryData`; `onError` restore + toast; `onSettled` invalidate.
- Zustand `persist` with `skipHydration: true`, rehydrate in an effect.

### dnd-kit × Motion (Things WP 5.0 spike)

- Outer `motion.li` owns `layout`; an inner element owns the `useSortable` ref and `CSS.Transform`. `layout = anyDragActive || reducedMotion ? false : "position"`, flipped in the same commit as the reorder. `DragOverlay` renders the moving card. Memoize sortable cards.

### Unfurl / SSRF

- Pin the checked IP in undici `Agent({ connect: { lookup } })`; handle both `all: true` and single-address callbacks; IP-literal hosts skip lookup, so check the URL host too. `redirect: "manual"`, max 3. Allow only `ipaddr.process(ip).range() === "unicast"`, ports 80/443.
- Cloud containers have no outbound DNS: unit tests inject `lookup`; e2e mocks real-site unfurls.

### Cloud container

- Docker daemon is not running by default: `dockerd &`. Start Supabase with `SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io pnpm supabase start -x studio,imgproxy,vector,logflare,edge-runtime,supavisor,realtime,postgres-meta`. On Docker Hub 429, pull from `mirror.gcr.io/supabase/<image>` and retag.
- Local stack: Postgres 17, API 54321, DB 54322, Mailpit 54324 (`GET /api/v1/search?query=to:<email>`).
- Playwright: `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome pnpm e2e`. Never `playwright install`.
- `next start` needs dummy Supabase env values or the proxy rejects requests.

## Planzz — known at planning time (2026-10-14)

- Postgres 17 locally (≥ 15), so `on delete set null (col)` column lists work.
- Current Claude model ids for the AI picker: Haiku `claude-haiku-5-5` (default), Sonnet `claude-sonnet-5-5`. **UNVERIFIED** against the SDK at Phase 9.

## Queue: to verify, by phase

Each phase's "Verify first" list repeats its items with details.

| Phase | Items |
| --- | --- |
| 1 | `pg_cron`, `pg_net`, Vault available on the local stack; generated column using `f_unaccent` (immutable wrapper) on PG17 |
| 2 | Sticky headers in a 2D `overflow: auto` container; `wheel` + `ctrlKey` pinch on macOS Safari/Chrome |
| 3 | dnd-kit auto-scroll inside a nested scroll container; `chrono-node` version and API; Tiptap v3 markdown extension (`@tiptap/markdown` vs community `tiptap-markdown`) |
| 4 | `react-markdown` + `remark-gfm` + `rehype-sanitize` versions; `shiki` web bundle size and lazy loading; `mammoth` browser build; `papaparse`; `iframe srcdoc` sandbox isolation with scripts on (§4.10 of the execution plan) |
| 6 | FullCalendar v6 React 19 support and CSS variable theming; `date-fns-tz` v3 API (`toZonedTime`, `fromZonedTime`) |
| 7 | `web-push` options and Node runtime; iOS 16.4+ PWA push constraints and notification actions support per platform; Brevo transactional API; `pg_net.http_post` signature; Vault functions |
| 8 | Google OAuth scopes (`calendar.app.created`, `calendar.calendarlist.readonly`, `calendar.events.readonly`) and verification rules; Calendar v3 `extendedProperties` |
| 9 | `@anthropic-ai/sdk` `dangerouslyAllowBrowser`, streaming tool-use helpers, model ids |
| 10 | `@axe-core/playwright` usage; Vercel production cron and env setup |
