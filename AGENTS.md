Load the overlay from github.com/judigot/ai. Start at AGENTS.md.
This repository is the app workspace; do not clone or treat judigot/ai as the project.

- If ~/ai exists, read ~/ai/AGENTS.md and follow its includes.
- Else fetch https://raw.githubusercontent.com/judigot/ai/main/AGENTS.md and the files it names from that same tree.

@docs/ecosystem.md

# Template Monorepo

Shared application foundation. Keep this generic. Put product-specific
behavior in product repos.

## Promote

Promote into this repo only after a pattern is proven in a real product and
the API is generic. Do not copy product-specific code here.

## Search

1. This repository
2. Active products (`bookingwars`, `ecommerce-app`)
3. Previous projects as references
4. Then invent
