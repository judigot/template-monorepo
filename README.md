# Template Monorepo

Production-ready Bun monorepo with a shared Hono REST API and two
interchangeable frontends (Vite and Next.js), orchestrated by Turborepo
and deployable to Vercel.

## Structure

```text
.
├── apps/
│   ├── api/                  # Hono REST API (@judigot/api)
│   │   ├── api/index.js      # Vercel Function placeholder (overwritten by build)
│   │   ├── src/app.ts        # Runtime-neutral Hono application
│   │   ├── src/index.ts      # Local dev entry (Bun or Node.js)
│   │   ├── src/vercel.ts     # Bundle entry for the Vercel Function
│   │   └── vercel.json       # /api/* routing rewrite
│   ├── vite/                 # Vite + React frontend (@judigot/vite) — primary example
│   └── nextjs/               # Next.js App Router frontend (@judigot/nextjs)
├── packages/
│   ├── api-client/           # Shared API contracts + typed fetch client
│   └── typescript-config/    # Shared TypeScript configurations
├── .github/workflows/ci.yml  # CI: format, lint, typecheck, test, build
├── biome.json                # Biome: formatting, import organization, selected lint rules
├── .oxlintrc.json            # Oxlint: primary JS/TS linter
├── turbo.json                # Turborepo task graph
└── bun.lock                  # The only lockfile
```

## Requirements

- **Bun** `1.3.14` (pinned in `packageManager`) — the sole package manager.
  This matches the Bun version on Vercel's default build image; do not
  regenerate `bun.lock` with Bun 1.4+ until Vercel's default supports its
  lockfile format.
- **Node.js** `>= 24` (current LTS, the default Vercel runtime) — only
  needed to run the API under Node; everything else runs through Bun.

Bun owns installation, the lockfile, and script execution; no other
package manager (npm, pnpm, Yarn) is required.

## Install

```sh
bun install
```

CI and reproducible installs use:

```sh
bun install --frozen-lockfile
```

## Development

| Command               | What it runs                                    |
| --------------------- | ----------------------------------------------- |
| `bun run dev`         | API + both frontends                            |
| `bun run dev:primary` | API + Vite frontend (the primary example)       |
| `bun run dev:vite`    | Vite frontend only (port 3001)                  |
| `bun run dev:nextjs`  | Next.js frontend only (port 3002)               |
| `bun run dev:api`     | Hono API only (port 3000)                       |

Quick start:

```sh
bun install
bun run dev:primary
# Vite:  http://localhost:3001  (proxies /api to the local API)
# API:   http://localhost:3000/api/hello
```

## Quality Gates

| Command                | Tooling                                            |
| ---------------------- | -------------------------------------------------- |
| `bun run format`       | Biome writes formatting + organizes imports        |
| `bun run format:check` | Biome verifies formatting (non-mutating)           |
| `bun run lint`         | Oxlint per workspace + Biome + ESLint (type-aware) |
| `bun run typecheck`    | `tsc --noEmit` per workspace                       |
| `bun run test`         | `bun test` per workspace                           |
| `bun run build`        | Production builds (Vite, Next.js, API typecheck)   |
| `bun run check`        | All of the above, in order                         |

Biome owns formatting. Linting runs as a chain with a strictness
hierarchy (highest last):

1. **Oxlint** (fast, per workspace): correctness rules with TypeScript,
   React, hooks, import, promise, Node, and Next.js plugins.
2. **Biome**: selected a11y/suspicious/style/security rules alongside
   formatting and import organization.
3. **ESLint** (strictest, final judge): the type-aware rules the other
   tools cannot provide yet — `strict-type-checked` +
   `stylistic-type-checked`, `strict-boolean-expressions`,
   `no-type-assertion` (no `as` outside tests), and `naming-convention`
   (`I`-prefixed interfaces).

ESLint requires the TypeScript JS API, which TypeScript 7 does not ship
(planned for 7.1) — that is why the root workspace pins TypeScript
`^5.9` for the linter while app workspaces use 7.x for their own `tsc`.
Type-aware Oxlint (`oxlint-tsgolint`) is still pre-1.0; revisit dropping
ESLint only when it stabilizes and typescript-eslint supports TS 7.

## API

`GET /api/hello` returns:

```json
{ "message": "Hello, world!" }
```

- `apps/api/src/app.ts` exports the runtime-neutral Hono app (no
  network listener) — directly testable with Web Standard
  `Request`/`Response`.
- `apps/api/src/index.ts` serves it locally: `bun src/index.ts` or
  `node src/index.ts` (Node ≥ 24 runs TypeScript natively).
- `apps/api/src/vercel.ts` adapts it for Vercel. The build script
  bundles it into `apps/api/api/index.js` (self-contained JavaScript),
  so Vercel deploys plain JS and never compiles TypeScript or resolves
  workspace imports. The committed `api/index.js` is a placeholder that
  the build overwrites — never commit the bundled output.

## How Both Frontends Consume the API

Both frontends call `GET /api/hello` through the shared
`@judigot/api-client` package (`getHello`), which owns the
`IHelloResponse` contract, status checking, JSON validation, and typed
errors. Nothing is hard-coded: the Vite app fetches client-side with
loading/error states, and the Next.js app fetches in a Server Component
with `loading.tsx`/`error.tsx` boundaries.

Each frontend renders a framework badge above the heading (blue/purple
"VITE" or green/teal "NEXT.JS") in every state, so you can always tell
which application a deployment is serving.

## Environment Variables

| Variable              | Consumed by     | Purpose                                              |
| --------------------- | --------------- | ---------------------------------------------------- |
| `VITE_API_URL`        | `apps/vite`     | Deployed API base URL (client-exposed)               |
| `API_URL`             | `apps/nextjs`   | Deployed API base URL (server-only)                  |
| `NEXT_PUBLIC_API_URL` | `apps/nextjs`   | Only if a Client Component fetches directly (unused) |
| `CORS_ORIGINS`        | `apps/api`      | Comma-separated allowed browser origins              |
| `PORT`                | `apps/api`      | Local dev port (default 3000)                        |

See the `.env.example` file in each app. Locally, none are required:
the Vite dev server proxies `/api` to `http://localhost:3000`, the
Next.js server falls back to the same URL, and the API allow-lists the
local dev origins. Never put secrets in `VITE_`- or `NEXT_PUBLIC`-
prefixed variables — they are embedded in client bundles.

Deployed values must use `https://` (e.g.
`VITE_API_URL=https://your-api.vercel.app`): browsers silently block
plain-HTTP requests from an HTTPS page as mixed content. None of these
are secrets — on Vercel, store them as plain Config variables, enabled
for both Production and Preview. Remember that `VITE_API_URL` is baked
in at build time, so changing it requires a redeploy.

## Testing

```sh
bun run test                                    # all workspaces
bun run test --filter=@judigot/api              # one workspace
```

Tests run with `bun test` and live in a `test/` directory inside each
workspace (`apps/api/test`, `apps/vite/test`, `apps/nextjs/test`,
`packages/api-client/test`), keeping every package independently
testable. Frontend component tests use happy-dom + Testing Library and
preload `test/setup.ts` via each app's `bunfig.toml`.
`apps/api/test/integration.test.ts` boots the real HTTP server on an
ephemeral port and exercises the shared client against it.

## Vercel Deployment

Two Vercel projects deploy from this repository. Vercel detects Bun
from `bun.lock` and installs with Bun at the monorepo root; Turborepo
scopes the build to the selected app.

### 1. API project

- **Root Directory:** `apps/api`
- The build bundles `src/vercel.ts` into `api/index.js`;
  `apps/api/vercel.json` rewrites `/api/(.*)` to that function, so
  `GET /api/hello` reaches the Hono route.
- Set `CORS_ORIGINS` to the deployed frontend origin(s).
- `apps/api` pins TypeScript `^5.9` (the rest of the monorepo uses 7.x):
  Vercel's function builder initializes its TypeScript pipeline from the
  workspace tsconfig even for JavaScript entries, and TypeScript 7's
  executable-only mode fails to resolve `types` libraries there. Keep
  the pin until `@vercel/node` supports TypeScript 7.

### 2. Frontend project (interchangeable)

- **Root Directory:** `apps/vite` (the documented primary selection).
- Keep `VITE_API_URL`, `API_URL`, and `NEXT_PUBLIC_API_URL` all set to
  the deployed API URL on this one project. Each frontend reads only
  its own variables, so the project can switch frameworks without
  reconfiguring API connectivity.
- To switch to Next.js: change Root Directory to `apps/nextjs` and
  redeploy. No repository changes are required; both apps have
  self-contained builds and resolve the Bun workspace root correctly.
- Each frontend commits its framework in `vercel.json`
  (`"framework": "vite"` / `"framework": "nextjs"`), which overrides the
  project's dashboard Framework Preset. Root Directory is therefore the
  only setting that changes when switching — the deployment never
  depends on a dashboard preset.
- The dashboard Framework Preset is consequently cosmetic. Vercel shows
  a "Configuration Settings … differ" banner whenever the current
  settings differ from those of the live production deployment; to keep
  it away, set the preset to match the current Root Directory and
  redeploy. Ignoring the banner is also fine — it never affects builds.

### Why there is no `apps/default`

"Primary" is a documentation and developer-experience convention, not a
package. Vite is the default example (README, quick start,
`dev:primary`), but both frontends are equal, independently buildable
deployables — a third `default` application would only duplicate one of
them.

## Versioning

Internal releases use [Changesets](https://github.com/changesets/changesets):
`bun run changeset`, `bun run version-packages`, `bun run release`.
