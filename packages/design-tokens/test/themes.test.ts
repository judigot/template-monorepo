import { expect, test } from 'bun:test';
import { applyTokenGroups, createThemeTokenGroups } from '../src/index.ts';

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

test('X applies its dark canvas and independent button, panel, and dialog shapes', () => {
  const values = new Map<string, string>();
  applyTokenGroups(createThemeTokenGroups('x'), {
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
  applyTokenGroups(createThemeTokenGroups('x'), target);
  applyTokenGroups(createThemeTokenGroups('default'), target);
  const defaults = new Map<string, string>();
  applyTokenGroups(createThemeTokenGroups('default'), {
    setProperty: (key, value) => {
      defaults.set(key, value);
    },
  });
  expect(values).toEqual(defaults);
});
