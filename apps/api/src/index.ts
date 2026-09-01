import { serve } from '@hono/node-server';
import { app } from './app.ts';
import { parsePort } from './env.ts';

/*
 * Local development entry point. Works under both Bun and Node.js:
 * `bun src/index.ts` or `node src/index.ts` (Node >= 24 strips types natively).
 * PORT is only read here — Vercel functions never start a listener.
 */
const port = parsePort();

serve({ fetch: app.fetch, port }, (info) => {
  console.error(`API listening on http://localhost:${String(info.port)}`);
});
