import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { resolveAllowedOrigins } from './app-origins.ts';
import { auth } from './auth.ts';

export { resolveAllowedOrigins } from './app-origins.ts';

import { healthRouter } from './routes/health.ts';
import { helloRouter } from './routes/hello.ts';

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
      credentials: true,
    }),
  );
  app.use('*', bodyLimit({ maxSize: MAX_REQUEST_BODY_BYTES }));

  // This application uses basePath('/api'), so Better Auth mounts at /auth/*.
  // Authentication is unavailable rather than insecure when secrets are absent.
  if (auth === null) {
    app.all('/auth/*', (c) =>
      c.json({ error: 'Authentication is not configured' }, 503),
    );
  } else {
    app.all('/auth/*', (c) => auth.handler(c.req.raw));
  }

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
