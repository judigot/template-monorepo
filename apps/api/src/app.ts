import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { parseCorsOrigins } from './env.ts';
import { healthRouter } from './routes/health.ts';
import { helloRouter } from './routes/hello.ts';

/*
 * Origins allowed when CORS_ORIGINS is not configured. These cover the
 * local Vite (3001) and Next.js (3002) dev servers.
 */
const DEVELOPMENT_ORIGINS = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
];

const MAX_REQUEST_BODY_BYTES = 1024 * 1024;

export function resolveAllowedOrigins(): string[] {
  const configured = parseCorsOrigins();

  if (configured === undefined || configured.length === 0) {
    return DEVELOPMENT_ORIGINS;
  }

  return configured;
}

/**
 * Creates the runtime-neutral Hono application.
 *
 * The application never starts a network server itself, so it can be
 * tested directly with Web Standard `Request`/`Response` objects and
 * adapted to Bun, Node.js, or Vercel by thin entry points.
 */
export function createApp(): Hono {
  const app = new Hono().basePath('/api');

  app.use('*', secureHeaders());
  app.use(
    '*',
    cors({
      origin: resolveAllowedOrigins(),
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );
  app.use('*', bodyLimit({ maxSize: MAX_REQUEST_BODY_BYTES }));

  app.route('/hello', helloRouter);
  app.route('/health', healthRouter);

  app.notFound((c) => {
    return c.json({ error: 'Not Found' }, 404);
  });

  app.onError((error, c) => {
    /* Log the full error server-side; never leak internals to clients. */
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  });

  return app;
}

export const app = createApp();
