import { describe, expect, it } from 'bun:test';
import { app, createApp, resolveAllowedOrigins } from '../src/app.ts';

describe('GET /api/hello', () => {
  it('returns 200', async () => {
    const response = await app.request('/api/hello');
    expect(response.status).toBe(200);
  });

  it('returns JSON', async () => {
    const response = await app.request('/api/hello');
    expect(response.headers.get('content-type')).toContain('application/json');
  });

  it('returns the hello world message', async () => {
    const response = await app.request('/api/hello');
    const payload: unknown = await response.json();
    expect(payload).toEqual({ message: 'Hello, world!' });
  });
});

describe('error handling', () => {
  it('returns 404 JSON for unknown routes', async () => {
    const response = await app.request('/api/does-not-exist');
    expect(response.status).toBe(404);
    const payload: unknown = await response.json();
    expect(payload).toEqual({ error: 'Not Found' });
  });

  it('returns a structured 500 response without internal details', async () => {
    /* Routes on createApp() are relative to its /api base path. */
    const throwingApp = createApp();
    throwingApp.get('/boom', () => {
      throw new Error('secret internal failure');
    });

    const response = await throwingApp.request('/api/boom');
    expect(response.status).toBe(500);
    expect(response.headers.get('content-type')).toContain('application/json');

    const payload: unknown = await response.json();
    expect(payload).toEqual({ error: 'Internal Server Error' });

    const body = JSON.stringify(payload);
    expect(body).not.toContain('secret internal failure');
    expect(body).not.toContain('at ');
  });
});

describe('GET /api/health', () => {
  it('returns a healthy status with a timestamp', async () => {
    const response = await app.request('/api/health');
    expect(response.status).toBe(200);

    const payload: unknown = await response.json();
    expect(payload).toMatchObject({ status: 'healthy' });
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'timestamp' in payload &&
      typeof payload.timestamp === 'string'
    ) {
      expect(Number.isNaN(Date.parse(payload.timestamp))).toBe(false);
    } else {
      throw new Error('health response is missing a timestamp string');
    }
  });
});

describe('security middleware', () => {
  it('sets secure headers on responses', async () => {
    const response = await app.request('/api/hello');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN');
  });
});

describe('CORS configuration', () => {
  it('allows the local dev origins by default', async () => {
    const response = await app.request('/api/hello', {
      headers: { Origin: 'http://localhost:3001' },
    });
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:3001',
    );
  });

  it('rejects origins that are not allow-listed', async () => {
    const response = await app.request('/api/hello', {
      headers: { Origin: 'https://evil.example.com' },
    });
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('parses a comma-separated CORS_ORIGINS value', () => {
    const previous = process.env.CORS_ORIGINS;
    process.env.CORS_ORIGINS =
      'https://vite.example.com, https://nextjs.example.com';

    expect(resolveAllowedOrigins()).toEqual([
      'https://vite.example.com',
      'https://nextjs.example.com',
    ]);

    if (previous === undefined) {
      delete process.env.CORS_ORIGINS;
    } else {
      process.env.CORS_ORIGINS = previous;
    }
  });
});
