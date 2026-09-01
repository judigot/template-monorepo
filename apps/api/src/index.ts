import { serve } from '@hono/node-server';
import { app } from './app.ts';

/*
 * Local development entry point. Works under both Bun and Node.js:
 * `bun src/index.ts` or `node src/index.ts` (Node >= 24 strips types natively).
 */
const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.error(`API listening on http://localhost:${String(info.port)}`);
});
