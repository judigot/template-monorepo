import { afterEach, describe, expect, it, mock } from 'bun:test';
import {
  ApiRequestError,
  buildApiUrl,
  getHello,
  type IHelloResponse,
} from '../src/index.ts';

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

    let caught: unknown;
    try {
      await getHello({ baseUrl: 'https://api.example.com' });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ApiRequestError);
    if (caught instanceof ApiRequestError) {
      expect(caught.status).toBe(500);
      expect(caught.url).toBe('https://api.example.com/api/hello');
    }
  });

  it('aborts when the request exceeds the timeout', async () => {
    globalThis.fetch = mock(
      (_input: Parameters<typeof fetch>[0], init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(
              init.signal?.reason instanceof Error
                ? init.signal.reason
                : new Error('aborted'),
            );
          });
        }),
    ) as unknown as typeof fetch;

    let caught: unknown;
    try {
      await getHello({ baseUrl: 'https://api.example.com', timeoutMs: 20 });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
  });

  it('throws a typed error for an unexpected response shape', async () => {
    mockFetch(
      () =>
        new Response(JSON.stringify({ unexpected: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );

    let caught: unknown;
    try {
      await getHello({ baseUrl: 'https://api.example.com' });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ApiRequestError);
  });
});
