import { expect, test } from 'bun:test';
import { app } from '../src/app.ts';

test('rejects invalid place slugs before querying the catalog', async () => {
  const response = await app.request('/api/places/Tatang%27s');
  expect(response.status).toBe(400);
});

test('reports an unconfigured place catalog without exposing credentials', async () => {
  const response = await app.request('/api/places/tatangs-lechon');
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    error: 'Place catalog is not configured',
  });
});
