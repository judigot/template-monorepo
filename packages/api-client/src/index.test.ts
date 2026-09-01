import { afterEach, describe, expect, it, mock } from 'bun:test';
import {
  ApiRequestError,
  buildApiUrl,
  getHello,
  type IHelloResponse,
} from './index.ts';

const originalFetch = globalThis.fetch;

function mockFetch(handler: (url: string) => Response): void {
  globalThis.fetch = mock((input: Parameters<typeof fetch>[0]) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    return Promise.resolve(handler(url));
  }) as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('buildApiUrl', () => {
  it('joins a base URL and path without duplicating slashes', () => {
    expect(buildApiUrl('https://api.example.com/', '/api/hello')).toBe(
      'https://api.example.com/api/hello',
    );
    expect(buildApiUrl('https://api.example.com', 'api/hello')).toBe(
      'https://api.example.com/api/hello',
    );
  });

  it('supports an empty base URL for same-origin requests', () => {
    expect(buildApiUrl('', '/api/hello')).toBe('/api/hello');
  });
});

describe('getHello', () => {
  it('returns the parsed response for a 200 JSON payload', async () => {
    const body: IHelloResponse = { message: 'Hello, world!' };
    mockFetch(
      () =>
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );

    const result = await getHello({ baseUrl: 'https://api.example.com' });
    expect(result).toEqual({ message: 'Hello, world!' });
  });

  it('requests the configured base URL', async () => {
    let requestedUrl = '';
    mockFetch((url) => {
      requestedUrl = url;
      return new Response(JSON.stringify({ message: 'Hello, world!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await getHello({ baseUrl: 'https://api.example.com' });
    expect(requestedUrl).toBe('https://api.example.com/api/hello');
  });

  it('throws a typed error for non-2xx responses', async () => {
    mockFetch(() => new Response('Server exploded', { status: 500 }));

    const promise = getHello({ baseUrl: 'https://api.example.com' });
    await expect(promise).rejects.toBeInstanceOf(ApiRequestError);

    try {
      await getHello({ baseUrl: 'https://api.example.com' });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        expect(error.status).toBe(500);
        expect(error.url).toBe('https://api.example.com/api/hello');
      } else {
        throw error;
      }
    }
  });

  it('throws a typed error for an unexpected response shape', async () => {
    mockFetch(
      () =>
        new Response(JSON.stringify({ unexpected: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );

    const promise = getHello({ baseUrl: 'https://api.example.com' });
    await expect(promise).rejects.toBeInstanceOf(ApiRequestError);
  });
});
