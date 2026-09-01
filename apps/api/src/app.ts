import { Hono } from 'hono';
import { cors } from 'hono/cors';
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

export function resolveAllowedOrigins(): string[] {
  const configured = process.env.CORS_ORIGINS;

  if (configured === undefined || configured.trim() === '') {
    return DEVELOPMENT_ORIGINS;
  }

  return configured
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '');
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

  app.use(
    '*',
    cors({
      origin: resolveAllowedOrigins(),
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  app.route('/hello', helloRouter);

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
