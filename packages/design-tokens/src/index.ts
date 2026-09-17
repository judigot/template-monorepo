import {
  createAppearance,
  type IAppearanceOverrides,
  THEME_APPEARANCES,
} from './appearance.ts';
import type { IPalette } from './palette.ts';
import { PALETTE, THEMES } from './palette.ts';

export type ThemeMode = 'system' | 'light' | 'dark';

/** Public product surfaces used for site-specific canvas and container treatment. */
interface IThemeSurfaces {
  light: string;
  dark: string;
  panelLight: string;
  panelDark: string;
  dialogLight: string;
  dialogDark: string;
}

const surfaces = (
  light: string,
  dark: string,
  panelLight = light,
  panelDark = dark,
  dialogLight = panelLight,
  dialogDark = panelDark,
): IThemeSurfaces => ({
  light,
  dark,
  panelLight,
  panelDark,
  dialogLight,
  dialogDark,
});

export const THEME_SURFACES: Record<keyof typeof THEMES, IThemeSurfaces> = {
  default: surfaces('#f8fafc', '#0f172a', '#ffffff', '#1e293b'),
  glass: surfaces(
    '#e8eef7',
    '#111827',
    'color-mix(in srgb, #ffffff 72%, transparent)',
    'color-mix(in srgb, #1f2937 76%, transparent)',
    'color-mix(in srgb, #ffffff 82%, transparent)',
    'color-mix(in srgb, #1f2937 88%, transparent)',
  ),
  light: surfaces('#ffffff', '#0f172a', '#ffffff', '#1e293b'),
  dark: surfaces('#ffffff', '#0f172a', '#ffffff', '#1e293b'),
  google: surfaces('#ffffff', '#202124', '#f8fafd', '#303134'),
  youtube: surfaces('#ffffff', '#0f0f0f', '#f9f9f9', '#272727'),
  wikipedia: surfaces('#ffffff', '#101418', '#f8f9fa', '#202122'),
  netflix: surfaces('#ffffff', '#141414', '#f5f5f5', '#181818'),
  spotify: surfaces('#121212', '#000000', '#181818', '#121212'),
  facebook: surfaces('#f0f2f5', '#18191a', '#ffffff', '#242526'),
  instagram: surfaces('#ffffff', '#000000', '#fafafa', '#121212'),
  x: surfaces('#ffffff', '#000000', '#ffffff', '#16181c'),
  reddit: surfaces('#ffffff', '#0b1416', '#f6f7f8', '#1a282d'),
  linkedin: surfaces('#f3f2ef', '#1d2226', '#ffffff', '#38434f'),
  amazon: surfaces('#ffffff', '#131921', '#f3f3f3', '#232f3e'),
  microsoft: surfaces('#ffffff', '#1f1f1f', '#f5f5f5', '#2b2b2b'),
  github: surfaces('#ffffff', '#0d1117', '#f6f8fa', '#161b22'),
  notion: surfaces('#ffffff', '#191919', '#fbfbfa', '#252525'),
  chatgpt: surfaces('#ffffff', '#212121', '#f7f7f8', '#2f2f2f'),
  adobe: surfaces('#ffffff', '#1d1d1d', '#f8f8f8', '#2c2c2c'),
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
      'surface-subtle':
        mode === 'dark' ? surfaces.panelDark : surfaces.panelLight,
      surface: mode === 'dark' ? surfaces.panelDark : surfaces.panelLight,
      dialog: mode === 'dark' ? surfaces.dialogDark : surfaces.dialogLight,
      input: mode === 'dark' ? surfaces.dialogDark : surfaces.dialogLight,
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
