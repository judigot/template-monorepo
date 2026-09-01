import { expect, test } from '@playwright/test';

const apiOrigin = 'http://127.0.0.1:3000';

test.describe('Hono API', () => {
  test('GET /api/hello returns the hello contract', async ({ request }) => {
    const response = await request.get(`${apiOrigin}/api/hello`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(await response.json()).toEqual({ message: 'Hello, world!' });
  });

  test('GET /api/health reports healthy', async ({ request }) => {
    const response = await request.get(`${apiOrigin}/api/health`);
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'healthy' });
  });

  test('unknown routes return structured JSON 404s', async ({ request }) => {
    const response = await request.get(`${apiOrigin}/api/nope`);
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: 'Not Found' });
  });
});
