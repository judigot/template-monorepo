import type { IPalette } from './palette.ts';
import { PALETTE } from './palette.ts';

export type { IPalette } from './palette.ts';
export { LIGHT_PALETTE, PALETTE, THEMES } from './palette.ts';

export interface ITokenGroup {
  cssPrefix: string;
  tokens: Record<string, string>;
}

function pick(ramp: Record<string, string>, shade: string): string {
  const value = ramp[shade];
  if (value === undefined) {
    throw new Error(`Palette is missing shade ${shade}`);
  }
  return value;
}

export function createColorTokens(palette: IPalette): Record<string, string> {
  return {
    canvas: pick(palette.neutral, '50'),
    surface: palette.white,
    'surface-subtle': pick(palette.neutral, '100'),
    text: pick(palette.neutral, '700'),
    'text-muted': pick(palette.neutral, '500'),
    border: pick(palette.neutral, '300'),
    'border-strong': pick(palette.neutral, '500'),
    primary: pick(palette.blue, '600'),
    'primary-hover': pick(palette.blue, '700'),
    'primary-subtle': pick(palette.blue, '100'),
    danger: pick(palette.red, '700'),
    'danger-subtle': pick(palette.red, '100'),
    success: pick(palette.green, '700'),
    info: pick(palette.teal, '600'),
    'on-primary': palette.white,
    'on-danger': palette.white,
  };
}

export function createTokenGroups(palette: IPalette = PALETTE): ITokenGroup[] {
  return [
    { cssPrefix: 'color', tokens: createColorTokens(palette) },
    {
      cssPrefix: 'radius',
      tokens: { sm: '0.5rem', md: '0.75rem', lg: '1rem', pill: '999px' },
    },
    {
      cssPrefix: 'type',
      tokens: {
        sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
        body: '1rem',
        small: '0.8125rem',
        heading: '1.125rem',
      },
    },
    {
      cssPrefix: 'shadow',
      tokens: {
        sm: '0 1px 2px rgb(17 24 39 / 8%)',
        lg: '0 20px 50px rgb(17 24 39 / 20%)',
      },
    },
    {
      cssPrefix: 'space',
      tokens: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.5rem',
        6: '2rem',
      },
    },
  ];
}

export function renderTokensCss(
  groups: ITokenGroup[] = createTokenGroups(PALETTE),
): string {
  const declarations = groups.flatMap(({ cssPrefix, tokens }) =>
    Object.entries(tokens).map(
      ([name, value]) => `  --ds-${cssPrefix}-${name}: ${value};`,
    ),
  );
  return `:root {\n${declarations.join('\n')}\n}\n`;
}

export function applyTokenGroups(
  groups: ITokenGroup[],
  target: { setProperty: (name: string, value: string) => void },
): void {
  for (const { cssPrefix, tokens } of groups) {
    for (const [name, value] of Object.entries(tokens)) {
      target.setProperty(`--ds-${cssPrefix}-${name}`, value);
    }
  }
}

export const COLOR_TOKENS = createColorTokens(PALETTE);
