# Public read-only API pattern

Use this optional pattern when a product intentionally publishes non-sensitive
information through Next.js App Router routes. Both a human-facing app and
external HTTP agents can call the same `GET` URLs. No MCP framework or agent
SDK is necessary for ordinary GET requests.

The generic helper is at `apps/nextjs/lib/public-api.ts`. It provides JSON
responses, a wildcard CORS policy, preflight responses, caching for successful
reads, and no-store on errors. Its implementation was validated against the
production API in `judigot/med-search`.

## Route example

```ts
import { publicJson, publicOptions } from '@/lib/public-api.ts';

export const OPTIONS = publicOptions;

export function GET(): Response {
  return publicJson({ items: [], total: 0 }, { cacheSeconds: 60 });
}
```

Validate all untrusted URL query parameters at the route boundary, using Zod
when applicable. Keep pagination bounded, document endpoints with OpenAPI and
include the data source and freshness in responses where appropriate. Provide
stable JSON schemas, descriptive errors, and test actual deployment requests.

## Security and architecture

- **Opt in only**: `Access-Control-Allow-Origin: *` is appropriate only for
  information deliberately public to unauthenticated clients. Never reuse it
  on private data or credential-based routes.
- GET and OPTIONS are the only allowed methods in this helper; do not imply
  write privileges or use cookie-based authentication with wildcard CORS.
- Successful GET responses may be cached. Do not cache personalized or
  sensitive information, and adjust caching for data freshness.
- The template also has a separate **Hono backend** with its own CORS
  middleware and typed API client. Continue to use that existing foundation
  when the product uses `apps/api` rather than Next.js API routes.
- MCP tools and OpenAPI schemas can wrap the same backend search functions, but
  they remain optional integration layers. No custom ChatGPT app is installed
  just because a route or MCP server is deployed.
