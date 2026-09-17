import { expect, test } from '@playwright/test';

const themes = [
  'default',
  'glass',
  'google',
  'youtube',
  'wikipedia',
  'netflix',
  'spotify',
  'facebook',
  'instagram',
  'x',
  'reddit',
  'linkedin',
  'amazon',
  'microsoft',
  'github',
  'notion',
  'chatgpt',
  'adobe',
];

// Deliberately runs in the browser: this handles CSS variables, color-mix,
// transparent layers, and the browser's rgb()/color(srgb ...) serialization.
async function contrast(
  page: import('@playwright/test').Page,
  selector: string,
) {
  return page
    .locator(selector)
    .first()
    .evaluate((element): number => {
      const parse = (
        value: string,
      ): [number, number, number, number] | null => {
        const m =
          /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/i.exec(
            value,
          ) ??
          /color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/i.exec(
            value,
          );
        if (!m) {
          return null;
        }
        const alphaValue = m[4];
        const alpha =
          alphaValue === undefined || alphaValue.length === 0
            ? 1
            : alphaValue.endsWith('%')
              ? Number(alphaValue.slice(0, -1)) / 100
              : Number(alphaValue);
        const isSrgb = value.trim().toLowerCase().startsWith('color(');
        const channels: [number, number, number] = isSrgb
          ? [Number(m[1]), Number(m[2]), Number(m[3])]
          : [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
        return [channels[0], channels[1], channels[2], alpha];
      };
      const blend = (
        fg: [number, number, number, number],
        bg: [number, number, number, number],
      ): [number, number, number, number] => {
        const a = fg[3] + bg[3] * (1 - fg[3]);
        return a
          ? [
              (fg[0] * fg[3] + bg[0] * bg[3] * (1 - fg[3])) / a,
              (fg[1] * fg[3] + bg[1] * bg[3] * (1 - fg[3])) / a,
              (fg[2] * fg[3] + bg[2] * bg[3] * (1 - fg[3])) / a,
              a,
            ]
          : bg;
      };
      const bg = (node: Element): [number, number, number, number] => {
        const parent = node.parentElement;
        const underneath: [number, number, number, number] = parent
          ? bg(parent)
          : [1, 1, 1, 1];
        const raw = getComputedStyle(node).backgroundColor;
        const color = parse(raw);
        if (!color && raw !== 'transparent') {
          throw new Error(`Cannot parse background color: ${raw}`);
        }
        return color ? blend(color, underneath) : underneath;
      };
      const fg = parse(getComputedStyle(element).color);
      if (!fg) {
        throw new Error(
          `Cannot parse foreground color: ${getComputedStyle(element).color}`,
        );
      }
      const b = bg(element);
      const lum = (c: [number, number, number, number]): number => {
        const linear = (v: number): number =>
          v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        return (
          linear(c[0]) * 0.2126 + linear(c[1]) * 0.7152 + linear(c[2]) * 0.0722
        );
      };
      const foreground = blend(fg, b);
      return (
        (Math.max(lum(foreground), lum(b)) + 0.05) /
        (Math.min(lum(foreground), lum(b)) + 0.05)
      );
    });
}

test.describe('theme contrast regressions', () => {
  for (const theme of themes) {
    test(`theme ${theme}`, async ({ page }) => {
      await page.goto('http://127.0.0.1:3001/');
      await page.selectOption('#design-system-theme', theme);
      for (const mode of ['light', 'dark']) {
        await page.selectOption('#appearance-mode', mode);
        await expect
          .poll(() =>
            page.locator('html').getAttribute('data-theme-preference'),
          )
          .toBe(mode);
        for (const selector of ['.ui-form-help', '.ui-button--primary']) {
          expect(await contrast(page, selector)).toBeGreaterThanOrEqual(
            selector.includes('button') ? 4.5 : 7,
          );
        }
        const button = page.locator('.ui-button--primary').first();
        await button.hover();
        expect(
          await contrast(page, '.ui-button--primary'),
        ).toBeGreaterThanOrEqual(4.5);
        const input = page.locator('.ui-tag-input input').first();
        await input.click();
        const option = page
          .locator('.ui-tag-suggestions [role="option"]')
          .first();
        await expect(option).toBeVisible();
        expect(
          await contrast(page, '.ui-tag-suggestions [role="option"] button'),
        ).toBeGreaterThanOrEqual(7);
        await option.hover();
        expect(
          await contrast(page, '.ui-tag-suggestions [role="option"] button'),
        ).toBeGreaterThanOrEqual(7);
        await input.press('ArrowDown');
        expect(
          await contrast(page, '.ui-tag-suggestions [role="option"] button'),
        ).toBeGreaterThanOrEqual(7);
      }
    });
  }

  test('system appearance responds to media changes', async ({ page }) => {
    await page.goto('http://127.0.0.1:3001/');
    await page.selectOption('#appearance-mode', 'system');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect
      .poll(() => page.locator('html').getAttribute('data-theme-preference'))
      .toBe('dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect
      .poll(() => page.locator('html').getAttribute('data-theme-preference'))
      .toBe('light');
  });
});
