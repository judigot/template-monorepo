import { describe, expect, it } from 'bun:test';
import { app } from '../src/app.ts';

describe('Better Auth route without credentials', () => {
  it('fails closed with 503, without exposing secrets', async () => {
    const response = await app.request('/api/auth/get-session');
    expect(response.status).toBe(503);
    const result: unknown = await response.json();
    expect(result).toEqual({ error: 'Authentication is not configured' });
  });

  it('does not trust arbitrary website origins for credentials', async () => {
    const response = await app.request('/api/auth/get-session', {
      headers: { Origin: 'https://attacker.example' },
    });
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('allows local travel web origins to send cookies', async () => {
    const response = await app.request('/api/auth/get-session', {
      headers: { Origin: 'http://localhost:8081' },
    });
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:8081',
    );
    expect(response.headers.get('access-control-allow-credentials')).toBe(
      'true',
    );
  });
});
