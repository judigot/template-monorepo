import {
  createAppearance,
  type IAppearanceOverrides,
  THEME_APPEARANCES,
} from './appearance.ts';
import type { IPalette } from './palette.ts';
import { PALETTE, THEMES } from './palette.ts';

export type ThemeMode = 'system' | 'light' | 'dark';

/** Public product surfaces used for the showcase's light/dark canvas treatment. */
export const THEME_SURFACES: Record<
  keyof typeof THEMES,
  { light: string; dark: string }
> = {
  default: { light: '#f8fafc', dark: '#0f172a' },
  light: { light: '#ffffff', dark: '#0f172a' },
  dark: { light: '#ffffff', dark: '#0f172a' },
  google: { light: '#ffffff', dark: '#202124' },
  youtube: { light: '#ffffff', dark: '#0f0f0f' },
  wikipedia: { light: '#ffffff', dark: '#101418' },
  netflix: { light: '#ffffff', dark: '#141414' },
  spotify: { light: '#121212', dark: '#000000' },
  facebook: { light: '#f0f2f5', dark: '#18191a' },
  instagram: { light: '#ffffff', dark: '#000000' },
  x: { light: '#ffffff', dark: '#000000' },
  reddit: { light: '#ffffff', dark: '#0b1416' },
  linkedin: { light: '#f3f2ef', dark: '#1d2226' },
  amazon: { light: '#ffffff', dark: '#131921' },
  microsoft: { light: '#ffffff', dark: '#1f1f1f' },
  github: { light: '#ffffff', dark: '#0d1117' },
  notion: { light: '#ffffff', dark: '#191919' },
  chatgpt: { light: '#ffffff', dark: '#212121' },
  adobe: { light: '#ffffff', dark: '#1d1d1d' },
};

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
  mode: Exclude<ThemeMode, 'system'> = 'light',
): ITokenGroup[] {
  const surfaces = THEME_SURFACES[name];
  const basePalette: IPalette = THEMES[name];
  const palette: IPalette = {
    ...basePalette,
    roles: {
      ...basePalette.roles,
      canvas: surfaces[mode],
      'surface-subtle': mode === 'dark' ? surfaces.dark : surfaces.light,
      surface: mode === 'dark' ? surfaces.dark : surfaces.light,
      dialog: mode === 'dark' ? surfaces.dark : surfaces.light,
      input: mode === 'dark' ? surfaces.dark : surfaces.light,
      ...(mode === 'dark'
        ? { text: '#f1f5f9', 'text-muted': '#a1a1aa', border: '#2b2e31' }
        : {}),
    },
  };
  return createTokenGroups(palette, {
    ...THEME_APPEARANCES[name],
    scheme: { mode },
  });
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
