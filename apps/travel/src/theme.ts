import {
  PALETTE,
  THEME_SURFACES,
  THEMES,
} from '@monorepo/design-tokens/palette';
import { useSystemScheme } from './theme-scheme';

const lightColors = {
  accent: PALETTE.teal['600'] ?? '#0f766e',
  ink: PALETTE.black,
  muted: PALETTE.neutral['500'] ?? '#64748b',
  canvas: '#f5f7f4',
  surface: PALETTE.white,
  resultsSurface: PALETTE.white,
  line: '#e3e9e5',
  accentSoft: '#e0f2e9',
  onAccent: PALETTE.white,
  imageFallback: '#c6d9ca',
  error: '#b42318',
  saved: '#be185d',
};

const darkColors: typeof lightColors = {
  accent: THEMES.dark.teal['600'],
  ink: THEMES.dark.black,
  muted: THEMES.dark.neutral['500'],
  canvas: THEME_SURFACES.dark.dark,
  surface: THEME_SURFACES.dark.panelDark,
  resultsSurface: THEME_SURFACES.dark.dark,
  line: THEMES.dark.neutral['300'],
  accentSoft: '#134e4a',
  onAccent: THEMES.dark.white,
  imageFallback: '#334155',
  error: THEMES.dark.red['700'],
  saved: '#f9a8d4',
};

export function useTravelColors() {
  return useSystemScheme() === 'dark' ? darkColors : lightColors;
}
