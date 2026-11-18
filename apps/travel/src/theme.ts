import { PALETTE } from '@monorepo/design-tokens/palette';

export const COLORS = {
  accent: PALETTE.teal['600'] ?? '#0f766e',
  ink: PALETTE.black,
  muted: PALETTE.neutral['500'] ?? '#64748b',
  canvas: '#f5f7f4',
  surface: PALETTE.white,
  line: '#e3e9e5',
  accentSoft: '#e0f2e9',
  imageFallback: '#c6d9ca',
} as const;
