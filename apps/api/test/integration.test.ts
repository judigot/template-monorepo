import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { getHello } from '@bigbang/api-client';
import type { ServerType } from '@hono/node-server';
import { serve } from '@hono/node-server';
import { app } from '../src/app.ts';

/*
 * Boots the real HTTP server on an ephemeral port and exercises the
 * shared API client against it, proving that both sides agree on the
 * /api/hello contract and on base-URL handling.
 */
describe('api-client against a live server', () => {
  let server: ServerType | undefined;
  let baseUrl = '';

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = serve({ fetch: app.fetch, port: 0 }, (info) => {
        baseUrl = `http://127.0.0.1:${String(info.port)}`;
        resolve();
      });
    });
  });

  afterAll(() => {
    server?.close();
  });

  it('resolves the hello contract end to end', async () => {
    const result = await getHello({ baseUrl });
    expect(result).toEqual({ message: 'Hello, world!' });
  });

  it('supports a trailing slash in the base URL', async () => {
    const result = await getHello({ baseUrl: `${baseUrl}/` });
    expect(result.message).toBe('Hello, world!');
  });
});
