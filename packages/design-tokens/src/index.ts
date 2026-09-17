import {
  createAppearance,
  type IAppearanceOverrides,
  THEME_APPEARANCES,
} from './appearance.ts';
import type { IPalette } from './palette.ts';
import { PALETTE, THEMES } from './palette.ts';

export { THEME_APPEARANCES } from './appearance.ts';
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
    dialog: palette.white,
    input: palette.white,
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
    'on-success': palette.white,
    'on-info': palette.white,
    focus: pick(palette.blue, '500'),
    overlay: 'color-mix(in srgb, var(--ds-color-text) 40%, transparent)',
    ...palette.roles,
  };
}

export function createTokenGroups(
  palette: IPalette = PALETTE,
  appearance: IAppearanceOverrides = {},
): ITokenGroup[] {
  return [
    { cssPrefix: 'color', tokens: createColorTokens(palette) },
    ...Object.entries(createAppearance(appearance)).map(
      ([cssPrefix, tokens]) => ({ cssPrefix, tokens }),
    ),
  ];
}

export function createThemeTokenGroups(
  name: keyof typeof THEMES,
): ITokenGroup[] {
  return createTokenGroups(THEMES[name], THEME_APPEARANCES[name]);
}

export function renderTokensCss(
  groups: ITokenGroup[] = createTokenGroups(PALETTE),
): string {
  const declarations = groups.flatMap(({ cssPrefix, tokens }) =>
    Object.entries(tokens).map(([name, value]) => {
      const declaration = `  --ds-${cssPrefix}-${name}: ${value};`;
      return value.startsWith('color-mix(')
        ? declaration
        : declaration.replace(' color-mix(', '\n    color-mix(');
    }),
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
