import { app } from './app.ts';

/*
 * Vercel Function entry. The build script bundles this file into
 * api/index.js (self-contained JavaScript), so Vercel never compiles
 * TypeScript or resolves workspace imports.
 */
const handler: { fetch: typeof app.fetch } = { fetch: app.fetch };

export default handler;
