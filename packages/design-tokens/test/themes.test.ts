import { expect, test } from 'bun:test';
import { applyTokenGroups, createThemeTokenGroups } from '../src/index.ts';
import { THEMES } from '../src/palette.ts';

type Rgb = readonly [number, number, number];

function rgb(color: string, canvas?: Rgb): Rgb {
  const hex = /^#([\da-f]{6})$/i.exec(color);
  const value = hex?.[1];
  if (value) {
    return [
      Number.parseInt(value.slice(0, 2), 16),
      Number.parseInt(value.slice(2, 4), 16),
      Number.parseInt(value.slice(4, 6), 16),
    ];
  }
  const glass =
    /^color-mix\(in srgb, (#[\da-f]{6}) (\d{1,3})%, transparent\)$/i.exec(
      color,
    );
  const foregroundColor = glass?.[1];
  const percentage = glass?.[2];
  if (!foregroundColor || !percentage || !canvas)
    throw new Error(`Unexpected test color ${color}`);
  const foreground = rgb(foregroundColor);
  const alpha = Number(percentage) / 100;
  return [
    Math.round(foreground[0] * alpha + canvas[0] * (1 - alpha)),
    Math.round(foreground[1] * alpha + canvas[1] * (1 - alpha)),
    Math.round(foreground[2] * alpha + canvas[2] * (1 - alpha)),
  ];
}

function contrast(
  foreground: string,
  background: string,
  canvas?: Rgb,
): number {
  const luminance = (color: Rgb) => {
    const linear = (channel: number) => {
      const value = channel / 255;
      return value <= 0.03928
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    };
    return (
      linear(color[0]) * 0.2126 +
      linear(color[1]) * 0.7152 +
      linear(color[2]) * 0.0722
    );
  };
  const [first, second] = [
    luminance(rgb(foreground, canvas)),
    luminance(rgb(background, canvas)),
  ];
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function expectContrast(
  foreground: string,
  background: string,
  minimum: number,
  canvas?: Rgb,
) {
  expect(contrast(foreground, background, canvas)).toBeGreaterThanOrEqual(
    minimum,
  );
}

function token(tokens: Record<string, string>, name: string): string {
  const value = tokens[name];
  if (value === undefined) throw new Error(`Missing ${name} token`);
  return value;
}

test('named systems provide distinct background tokens', () => {
  const google = createThemeTokenGroups('google')[0];
  const spotify = createThemeTokenGroups('spotify')[0];
  if (!google || !spotify) {
    throw new Error('color token groups are required');
  }
  expect(google.tokens.canvas).not.toBe(spotify.tokens.canvas);
  expect(google.tokens['surface-subtle']).not.toBe(
    spotify.tokens['surface-subtle'],
  );
});

test('glass provides translucent container tokens', () => {
  const colorTokens = createThemeTokenGroups('glass')[0]?.tokens;
  if (!colorTokens) {
    throw new Error('color token group is required');
  }
  expect(colorTokens.surface).toContain('color-mix');
  expect(colorTokens.dialog).toContain('color-mix');
});

test('X applies its dark canvas and independent button, panel, and dialog shapes', () => {
  const values = new Map<string, string>();
  applyTokenGroups(createThemeTokenGroups('x', 'dark'), {
    setProperty: (key, value) => {
      values.set(key, value);
    },
  });
  expect(values.get('--ds-color-canvas')).toBe('#000000');
  expect(values.get('--ds-scheme-mode')).toBe('dark');
  expect(values.get('--ds-radius-button')).toBe('9999px');
  expect(values.get('--ds-radius-panel')).toBe('16px');
  expect(values.get('--ds-radius-dialog')).toBe('32px');
  expect(values.get('--ds-color-on-primary')).not.toBe(
    values.get('--ds-color-primary'),
  );
});

test('switching themes replaces every token, leaving no dark theme residue', () => {
  const values = new Map<string, string>();
  const target = {
    setProperty: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  applyTokenGroups(createThemeTokenGroups('x', 'dark'), target);
  applyTokenGroups(createThemeTokenGroups('default', 'light'), target);
  const defaults = new Map<string, string>();
  applyTokenGroups(createThemeTokenGroups('default', 'light'), {
    setProperty: (key, value) => {
      defaults.set(key, value);
    },
  });
  expect(values).toEqual(defaults);
});

test('every named theme and mode meets the token contrast contract', () => {
  for (const name of Object.keys(THEMES) as Array<keyof typeof THEMES>) {
    for (const mode of ['light', 'dark'] as const) {
      const tokens = createThemeTokenGroups(name, mode)[0]?.tokens;
      if (!tokens) throw new Error(`${name}/${mode} requires color tokens`);
      const canvas = rgb(token(tokens, 'canvas'));
      const readingSurfaces = [
        'canvas',
        'surface',
        'surface-subtle',
        'dialog',
        'input',
      ].map((name) => token(tokens, name));
      for (const background of readingSurfaces) {
        expectContrast(token(tokens, 'text'), background, 7, canvas);
        expectContrast(token(tokens, 'text-muted'), background, 7, canvas);
        expectContrast(token(tokens, 'border-strong'), background, 3, canvas);
        expectContrast(token(tokens, 'focus'), background, 3, canvas);
        for (const inline of [
          'primary-text',
          'danger-text',
          'success-text',
          'info-text',
        ] as const) {
          expectContrast(token(tokens, inline), background, 7, canvas);
        }
      }
      expect(token(tokens, 'popover')).toMatch(/^#[\da-f]{6}$/i);
      expectContrast(
        token(tokens, 'popover-text'),
        token(tokens, 'popover'),
        7,
        canvas,
      );
      expectContrast(
        token(tokens, 'option-hover-text'),
        token(tokens, 'option-hover'),
        7,
        canvas,
      );
      expectContrast(
        token(tokens, 'option-selected-text'),
        token(tokens, 'option-selected'),
        7,
        canvas,
      );
      expectContrast(
        token(tokens, 'primary-subtle-text'),
        token(tokens, 'primary-subtle'),
        7,
        canvas,
      );
      expectContrast(
        token(tokens, 'danger-subtle-text'),
        token(tokens, 'danger-subtle'),
        7,
        canvas,
      );
      expectContrast(
        token(tokens, 'on-primary'),
        token(tokens, 'primary'),
        4.5,
        canvas,
      );
      expectContrast(
        token(tokens, 'on-primary-hover'),
        token(tokens, 'primary-hover'),
        4.5,
        canvas,
      );
    }
  }
});
