import { expect, test } from '@playwright/test';

test.describe('Next.js frontend (production build)', () => {
  test('identifies itself and server-renders the live API message', async ({
    page,
  }) => {
    await page.goto('http://127.0.0.1:3002/');

    /*
     * Wait for the success heading first. During App Router streaming the
     * loading UI (which also renders the badge) can still be in the DOM.
     */
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Hello, world!',
      { timeout: 15_000 },
    );
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page
        .getByRole('heading', { level: 1 })
        .locator('..')
        .getByTestId('framework-badge'),
    ).toHaveText('Next.js');
  });
});
