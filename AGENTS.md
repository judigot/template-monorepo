# Template Monorepo

Shared application foundation. Per-project stub from `judigot/project-core`.

@~/ai/settings/rules.md
@~/ai/settings/workflow.md
@~/ai/settings/stack.md
@~/ai/settings/references.md
@~/ai/settings/ecosystem.md

@docs/ecosystem.md

## This repository

Keep this template generic, intentional, and reusable. It is the starting
point for new apps and the place proven generic improvements return to.

Do not add bookingwars, ecommerce-app, or other product behavior here.

- Change foundation tooling, shared packages, and generic app patterns only.
- Before adding a package or abstraction, confirm it is needed beyond one
  product, or is clearly shared infrastructure (TypeScript, lint, test, CI).
- Prefer improving an existing package over creating a new one.
- When adopting a pattern from a product, generalize it onto this stack
  (Bun, `@bigbang/*`, Biome, Oxlint, ESLint). Do not copy product files
  verbatim.
- Do not force products to consume a new abstraction.

Product repos may diverge when their requirements differ. Record that
divergence in the product's `AGENTS.md` rather than weakening this template.
