import { expect, test } from '@playwright/test';

test.describe('Vite frontend (production build)', () => {
  test('identifies itself and renders the live API message', async ({
    page,
  }) => {
    await page.goto('http://127.0.0.1:3001/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Hello, world!',
    );
    await expect(page.getByTestId('framework-badge')).toHaveText('Vite');
  });
});
