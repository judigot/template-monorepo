import { serve } from '@hono/node-server';
import { app } from './app.ts';
import { parseEnv } from './env.ts';

/*
 * Local development entry point. Works under both Bun and Node.js:
 * `bun src/index.ts` or `node src/index.ts` (Node >= 24 strips types natively).
 */
const { PORT } = parseEnv();

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.error(`API listening on http://localhost:${String(info.port)}`);
});
