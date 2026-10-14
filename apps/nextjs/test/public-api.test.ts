import { describe, expect, test } from 'bun:test';
import { publicJson, publicOptions } from '@/lib/public-api.ts';

describe('optional public GET response helpers', () => {
  test('returns predictable JSON and GET-only CORS policy', async () => {
    const response = publicJson({ items: [], page: 1 });
    const payload: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
      'GET, OPTIONS',
    );
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=30');
    expect(payload).toEqual({ items: [], page: 1 });
  });

  test('does not cache rejected requests or server errors', () => {
    expect(
      publicJson({ error: 'Invalid request' }, { status: 400 }).headers.get(
        'Cache-Control',
      ),
    ).toBe('no-store');
    expect(
      publicJson({ error: 'Unavailable' }, { status: 503 }).headers.get(
        'Cache-Control',
      ),
    ).toBe('no-store');
  });

  test('supports preflight without requiring a database or network', () => {
    const response = publicOptions();
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain(
      'Content-Type',
    );
  });
});
