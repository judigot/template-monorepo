import {
  createAppearance,
  type IAppearanceOverrides,
  THEME_APPEARANCES,
} from './appearance.ts';
import type { IPalette } from './palette.ts';
import { PALETTE, THEME_SURFACES, THEMES } from './palette.ts';

export type ThemeMode = 'system' | 'light' | 'dark';

/** Public product surfaces used for site-specific canvas and container treatment. */
export { THEME_APPEARANCES } from './appearance.ts';
export type { IPalette } from './palette.ts';
export { LIGHT_PALETTE, PALETTE, THEME_SURFACES, THEMES } from './palette.ts';

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

type Rgb = readonly [number, number, number];

function parseHex(color: string): Rgb {
  const match = /^#([\da-f]{6})$/i.exec(color);
  const hex = match?.[1];
  if (hex === undefined || hex.length === 0) {
    throw new Error(
      `Expected an opaque six-digit hex color, received ${color}`,
    );
  }
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function composite(foreground: Rgb, alpha: number, background: Rgb): Rgb {
  return [
    Math.round(foreground[0] * alpha + background[0] * (1 - alpha)),
    Math.round(foreground[1] * alpha + background[1] * (1 - alpha)),
    Math.round(foreground[2] * alpha + background[2] * (1 - alpha)),
  ];
}

/** Resolves the only translucent surface syntax emitted by the palette. */
function resolveSurface(color: string, canvas: Rgb): Rgb {
  if (color.startsWith('#')) {
    return parseHex(color);
  }
  const match =
    /^color-mix\(in srgb, (#[\da-f]{6}) (\d{1,3})%, transparent\)$/i.exec(
      color,
    );
  if (!match) {
    throw new Error(
      `Unsupported surface color ${color}; use #rrggbb or the supported glass color-mix`,
    );
  }
  const foreground = match[1];
  const percentage = match[2];
  if (
    foreground === undefined ||
    foreground.length === 0 ||
    percentage === undefined ||
    percentage.length === 0
  ) {
    throw new Error(`Invalid glass surface ${color}`);
  }
  const alpha = Number(percentage) / 100;
  if (alpha < 0 || alpha > 1) {
    throw new Error(`Invalid glass opacity in ${color}`);
  }
  return composite(parseHex(foreground), alpha, canvas);
}

function luminance(color: Rgb): number {
  const linear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return (
    linear(color[0]) * 0.2126 +
    linear(color[1]) * 0.7152 +
    linear(color[2]) * 0.0722
  );
}

function contrast(foreground: Rgb, background: Rgb): number {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

function safest(
  candidates: string[],
  backgrounds: Rgb[],
  minimum: number,
  role: string,
): string {
  const scored = candidates.map((color) => ({
    color,
    score: Math.min(
      ...backgrounds.map((background) => contrast(parseHex(color), background)),
    ),
  }));
  // Keep the palette's intended hue when it is already accessible.  The most
  // contrasting fallback is only for colors that cannot clear the requirement.
  const passing = scored.find((candidate) => candidate.score >= minimum);
  if (passing) {
    return passing.color;
  }
  const best = scored[0];
  if (!best) {
    throw new Error(`No color candidates were supplied for ${role}`);
  }
  const mostContrasting = scored
    .slice(1)
    .reduce(
      (winner, candidate) =>
        candidate.score > winner.score ? candidate : winner,
      best,
    );
  if (mostContrasting.score < minimum) {
    throw new Error(
      `${role} cannot meet ${String(minimum)}:1 contrast (best is ${mostContrasting.score.toFixed(2)}:1)`,
    );
  }
  return mostContrasting.color;
}

export function createColorTokens(palette: IPalette): Record<string, string> {
  const canvas = palette.roles?.canvas ?? pick(palette.neutral, '50');
  const surface = palette.roles?.surface ?? palette.white;
  const primary = pick(palette.blue, '600');
  const danger = pick(palette.red, '700');
  const success = pick(palette.green, '700');
  const info = pick(palette.teal, '600');
  const primarySubtle = pick(palette.blue, '100');
  const dangerSubtle = pick(palette.red, '100');
  const optionHover =
    palette.roles?.['option-hover'] ?? pick(palette.neutral, '100');
  const optionSelected = palette.roles?.['option-selected'] ?? primarySubtle;
  const canvasRgb = parseHex(canvas);
  const surfaceRgb = resolveSurface(surface, canvasRgb);
  const dialog = palette.roles?.dialog ?? surface;
  const input = palette.roles?.input ?? surface;
  const panel =
    palette.roles?.['surface-subtle'] ?? pick(palette.neutral, '100');
  const dialogRgb = resolveSurface(dialog, canvasRgb);
  const inputRgb = resolveSurface(input, canvasRgb);
  const panelRgb = resolveSurface(panel, canvasRgb);
  // Menus must remain opaque: glass containers may be translucent, but their popover is not.
  const popover = palette.roles?.popover ?? palette.white;
  const popoverRgb = parseHex(popover);
  const readingSurfaces = [
    canvasRgb,
    surfaceRgb,
    panelRgb,
    dialogRgb,
    inputRgb,
  ];
  const neutral700 = pick(palette.neutral, '700');
  const neutral500 = pick(palette.neutral, '500');
  const text = safest(
    [neutral700, palette.black, palette.white],
    readingSurfaces,
    7,
    'text',
  );
  const mutedText = safest(
    [neutral500, neutral700, palette.black, palette.white],
    readingSurfaces,
    7,
    'text-muted',
  );
  const strongBorder = safest(
    [neutral500, neutral700, palette.black, palette.white],
    readingSurfaces,
    3,
    'border-strong',
  );
  const focus = safest(
    [
      pick(palette.blue, '500'),
      primary,
      pick(palette.blue, '700'),
      palette.black,
      palette.white,
    ],
    readingSurfaces,
    3,
    'focus',
  );
  const inlineCandidates = [
    pick(palette.blue, '700'),
    danger,
    success,
    info,
    neutral700,
    palette.black,
    palette.white,
  ];
  return {
    canvas,
    surface,
    dialog,
    input,
    'surface-subtle': panel,
    text,
    'text-muted': mutedText,
    border: pick(palette.neutral, '300'),
    'border-strong': strongBorder,
    primary,
    'primary-hover': pick(palette.blue, '700'),
    'primary-subtle': primarySubtle,
    danger,
    'danger-subtle': dangerSubtle,
    success,
    info,
    'on-primary': safest(
      [palette.white, palette.black],
      [parseHex(primary)],
      4.5,
      'on-primary',
    ),
    'on-danger': safest(
      [palette.white, palette.black],
      [parseHex(danger)],
      4.5,
      'on-danger',
    ),
    'on-success': safest(
      [palette.white, palette.black],
      [parseHex(success)],
      4.5,
      'on-success',
    ),
    'on-info': safest(
      [palette.white, palette.black],
      [parseHex(info)],
      4.5,
      'on-info',
    ),
    'primary-text': safest(
      [pick(palette.blue, '700'), ...inlineCandidates],
      readingSurfaces,
      7,
      'primary-text',
    ),
    'danger-text': safest(
      [danger, ...inlineCandidates],
      readingSurfaces,
      7,
      'danger-text',
    ),
    'success-text': safest(
      [success, ...inlineCandidates],
      readingSurfaces,
      7,
      'success-text',
    ),
    'info-text': safest(
      [info, ...inlineCandidates],
      readingSurfaces,
      7,
      'info-text',
    ),
    'primary-subtle-text': safest(
      [pick(palette.blue, '700'), neutral700, palette.black, palette.white],
      [parseHex(primarySubtle)],
      7,
      'primary-subtle-text',
    ),
    'danger-subtle-text': safest(
      [danger, neutral700, palette.black, palette.white],
      [parseHex(dangerSubtle)],
      7,
      'danger-subtle-text',
    ),
    popover,
    'popover-text': safest(
      [neutral700, palette.black, palette.white],
      [popoverRgb],
      7,
      'popover-text',
    ),
    'option-hover': optionHover,
    'option-hover-text':
      palette.roles?.['option-hover-text'] ??
      safest(
        [neutral700, palette.black, palette.white],
        [resolveSurface(optionHover, canvasRgb)],
        7,
        'option-hover-text',
      ),
    'option-selected': optionSelected,
    'option-selected-text':
      palette.roles?.['option-selected-text'] ??
      safest(
        [pick(palette.blue, '700'), neutral700, palette.black, palette.white],
        [resolveSurface(optionSelected, canvasRgb)],
        7,
        'option-selected-text',
      ),
    'on-primary-hover': safest(
      [palette.white, palette.black],
      [parseHex(pick(palette.blue, '700'))],
      4.5,
      'on-primary-hover',
    ),
    focus,
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
