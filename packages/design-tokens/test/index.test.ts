import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import {
  applyTokenGroups,
  createColorTokens,
  createTokenGroups,
  renderTokensCss,
} from '../src/index.ts';
import { type IPalette, PALETTE } from '../src/palette.ts';

const brand: IPalette = {
  black: '#101010',
  blue: { 100: '#abc100', 500: '#abc500', 600: '#abc600', 700: '#abc700' },
  green: { 100: '#abc800', 700: '#abc900' },
  neutral: {
    50: '#abd000',
    100: '#abd100',
    300: '#abd300',
    500: '#abd500',
    700: '#abd700',
  },
  red: { 100: '#abe100', 700: '#abe700' },
  teal: { 600: '#abf600' },
  white: '#abffff',
};

describe('design tokens', () => {
  it('maps imported palette roles without changing the default', () => {
    expect(createColorTokens(brand).primary).toBe('#abc600');
    expect(createColorTokens(brand).primary).not.toBe(
      createColorTokens(PALETTE).primary,
    );
  });
  it('renders the generator output as the committed snapshot', () => {
    expect(renderTokensCss()).toBe(
      readFileSync(new URL('../src/tokens.css', import.meta.url), 'utf8'),
    );
    expect(renderTokensCss(createTokenGroups(brand))).toContain('#abc600');
  });
  it('applies every token to runtime CSS', () => {
    const values = new Map<string, string>();
    applyTokenGroups(createTokenGroups(brand), {
      setProperty: (key, value) => values.set(key, value),
    });
    expect(values.get('--ds-color-primary')).toBe('#abc600');
  });
});
