# Personal Software Ecosystem

This repository is the shared application foundation. Product repos are not
isolated copies: they start from (or learn from) this template, then feed
proven generic improvements back.

The objective is not maximum code sharing. The objective is a high-quality,
reusable personal engineering foundation based on real experience.

```text
Previous projects → proven patterns → shared template
  → new projects → new lessons → improved template
```

A successful outcome: every new project starts with the best parts of previous
work, and every project has the potential to make the foundation better for
the next one.

## Repository roles

| Repository | Role |
| --- | --- |
| `judigot/template-monorepo` | Shared foundation. Generic, intentional, reusable. |
| https://github.com/judigot/project-core | App `AGENTS.md` only. Overlay loader plus a repo-specific section. Not application code. |
| https://github.com/judigot/bookingwars | Active product created from this template. Evolves independently; also a source of patterns that may be promoted here. |
| https://github.com/judigot/ecommerce-app | Active product. Same dual role as bookingwars. Stack divergence is allowed when requirements differ. |
| https://github.com/judigot/ai | Agent overlay (rules, workflow, skills). Not application code. |
| `judigot/user` | Dotfiles, generators, and IDE scaffolding. Complementary to this template, not a replacement for it. |
| Previous projects (`frontend`, `stp`, others) | References. Proven implementations, failed approaches, and tooling — consult, do not copy automatically. |

Do not modify `judigot/scaffolder` unless the user explicitly authorizes it.

## What belongs here

Add only what has demonstrated, or strongly indicated, value beyond a single
project:

- Reusable UI components and design-system primitives
- Shared hooks, utilities, and packages
- TypeScript, lint, format, test, build, and CI configuration
- Common application patterns
- API and authentication foundations
- Developer tooling

This template must not become a collection of everything that has ever been
written.

## What stays in a product

Keep local when the behavior, API, or requirements are product-specific:

- Booking, catalogue, cart, checkout, pricing, and locale copy
- Product names, branding, and domain routing
- Stack choices a product has already diverged from (for example ecommerce-app
  using pnpm and Prettier while this template uses Bun and Biome)

Similarity of shape is not enough. Two buttons, two Zod schemas, or two API
clients should be shared only when the underlying behavior and API are
actually generic.

## Reuse before reinvention

Before creating a new solution, search in this order:

1. The current project's existing implementation
2. This template
3. The other active products (`bookingwars`, `ecommerce-app`)
4. Relevant previous projects, as references
5. Then invent

Compare existing approaches. Reuse or improve the most appropriate proven
solution. Do not assume code should be shared merely because two projects have
something that looks similar.

## Template evolution

Useful default:

```text
Build locally → validate in a real project → identify the reusable part
  → generalize → move it into this template
```

Avoid premature abstractions. Promote a change here only when all of these
hold:

1. It is needed by more than one project, or it is clearly foundation
   (tooling, TypeScript, lint, test, CI, Vercel layout).
2. The API and behavior are generic: no product names, no domain-only rules.
3. It can live on this template's stack (Bun, Turborepo, Oxlint → Biome →
   ESLint, `bun test`, Playwright) without dragging product dependencies.
4. It does not force unrelated complexity onto products that do not need it.
5. It was validated in a real project, not designed in the abstract.

When promoting from a diverged product, re-implement on this stack. Do not
copy ecommerce-app files verbatim into `@bigbang/*` packages.

The template supports projects; it does not dictate them. Product repos stay
standalone. They must not document this charter or the promotion loop.

Apps load agent rules from https://github.com/judigot/ai through one
entrypoint: fetch that overlay's `AGENTS.md` from GitHub raw. Always use that
live tree. Do not clone the overlay, and do not read `~/ai` or other local
clones (those copies can be stale). When the workspace is this template, the
overlay also loads `docs/ecosystem.md`. Do not put that charter in `AGENTS.md`;
it would copy into new projects. Product `AGENTS.md` files stay product-only
after the overlay loader.

## Current foundation

Already in this repository and worth keeping generic:

- Bun workspaces + Turborepo
- Hono API (`health`, `hello`) with Zod env validation and Vercel adapter
- Interchangeable Vite and Next.js frontends
- `@bigbang/api-client` and `@bigbang/typescript-config`
- Oxlint → Biome → ESLint `strict-type-checked`
- `bun test` plus Playwright against production builds
- Two-project Vercel layout, Changesets, Renovate, Husky

Intentionally absent until proven across products:

- A UI / design-system package (ecommerce-app `Button` is a local starting
  point; `ProductCard` is commerce-specific)
- Auth (planned in ecommerce-app as Better Auth — promote only after it is
  proven and generic)
- Database / Drizzle (schemas in ecommerce-app are commerce-specific)
- i18n infrastructure (resources there are storefront-specific)

## Continuous improvement

When working on any project in this ecosystem, also ask:

- Have we solved this before?
- Is there already a better implementation somewhere?
- Are we duplicating something that belongs in this template?
- Did we discover a reusable pattern — or a weakness in this template?
- Did we learn something worth documenting?
- Would this approach still make sense across several future projects?
