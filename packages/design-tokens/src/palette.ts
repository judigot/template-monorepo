export interface IPalette {
  roles?: Partial<
    Record<
      | 'surface'
      | 'dialog'
      | 'input'
      | 'on-primary'
      | 'on-danger'
      | 'on-success'
      | 'on-info'
      | 'focus'
      | 'overlay',
      string
    >
  >;
  black: string;
  blue: Record<string, string>;
  green: Record<string, string>;
  neutral: Record<string, string>;
  red: Record<string, string>;
  teal: Record<string, string>;
  white: string;
}

export const PALETTE: IPalette = {
  black: '#111827',
  blue: { 100: '#dbeafe', 500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af' },
  green: { 100: '#dcfce7', 700: '#15803d' },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    300: '#cbd5e1',
    500: '#64748b',
    700: '#334155',
  },
  red: { 100: '#fee2e2', 700: '#b91c1c' },
  teal: { 600: '#0f766e' },
  white: '#ffffff',
};

export const LIGHT_PALETTE: IPalette = {
  black: '#0f172a',
  blue: { 100: '#e0f2fe', 500: '#0284c7', 600: '#0369a1', 700: '#075985' },
  green: { 100: '#d1fae5', 700: '#047857' },
  neutral: {
    50: '#ffffff',
    100: '#f8fafc',
    300: '#cbd5e1',
    500: '#64748b',
    700: '#1e293b',
  },
  red: { 100: '#ffe4e6', 700: '#be123c' },
  teal: { 600: '#0f766e' },
  white: '#ffffff',
};

const brandPalette = (
  primary: [string, string, string, string],
  info: string,
): IPalette => ({
  ...PALETTE,
  blue: {
    100: primary[0],
    500: primary[1],
    600: primary[2],
    700: primary[3],
  },
  teal: { 600: info },
});

export const BRAND_PALETTES = {
  google: brandPalette(['#e0f2fe', '#0284c7', '#0369a1', '#075985'], '#16a34a'),
  youtube: brandPalette(
    ['#fee2e2', '#dc2626', '#b91c1c', '#991b1b'],
    '#7f1d1d',
  ),
  wikipedia: brandPalette(
    ['#e2e8f0', '#475569', '#334155', '#1e293b'],
    '#64748b',
  ),
  netflix: brandPalette(
    ['#fee2e2', '#e11d48', '#be123c', '#9f1239'],
    '#fb7185',
  ),
  spotify: brandPalette(
    ['#dcfce7', '#16a34a', '#15803d', '#166534'],
    '#0f766e',
  ),
  facebook: brandPalette(
    ['#dbeafe', '#2563eb', '#1d4ed8', '#1e40af'],
    '#0891b2',
  ),
  instagram: brandPalette(
    ['#fce7f3', '#db2777', '#be185d', '#9d174d'],
    '#9333ea',
  ),
  x: {
    black: '#000000',
    white: '#ffffff',
    blue: { 100: '#16181c', 500: '#1d9bf0', 600: '#e7e9ea', 700: '#d7dbdc' },
    neutral: {
      50: '#000000',
      100: '#16181c',
      300: '#2b2e31',
      500: '#a1a1aa',
      700: '#e7e9ea',
    },
    green: { 100: '#002218', 700: '#61d6a3' },
    red: { 100: '#3d0105', 700: '#f87580' },
    teal: { 600: '#1d9bf0' },
    roles: {
      surface: '#000000',
      dialog: '#141414',
      input: '#000000',
      'on-primary': '#0f1419',
      'on-success': '#000000',
      'on-danger': '#000000',
      'on-info': '#000000',
      focus: '#1d9bf0',
      overlay: '#5b708366',
    },
  },
  reddit: brandPalette(['#ffedd5', '#ea580c', '#c2410c', '#9a3412'], '#f97316'),
  linkedin: brandPalette(
    ['#dbeafe', '#0284c7', '#0369a1', '#075985'],
    '#0e7490',
  ),
  amazon: brandPalette(['#fef3c7', '#d97706', '#b45309', '#92400e'], '#ea580c'),
  microsoft: brandPalette(
    ['#cffafe', '#0891b2', '#0e7490', '#155e75'],
    '#2563eb',
  ),
  github: brandPalette(['#e2e8f0', '#334155', '#1e293b', '#0f172a'], '#475569'),
  notion: brandPalette(['#f1f5f9', '#475569', '#334155', '#1e293b'], '#0f766e'),
  chatgpt: brandPalette(
    ['#ccfbf1', '#0f766e', '#115e59', '#134e4a'],
    '#14b8a6',
  ),
  adobe: brandPalette(['#fee2e2', '#dc2626', '#b91c1c', '#991b1b'], '#f97316'),
} as const satisfies Record<string, IPalette>;

export const THEMES = {
  default: PALETTE,
  light: LIGHT_PALETTE,
  dark: {
    black: '#ffffff',
    blue: { 100: '#172554', 500: '#60a5fa', 600: '#93c5fd', 700: '#bfdbfe' },
    green: { 100: '#052e16', 700: '#86efac' },
    neutral: {
      50: '#0f172a',
      100: '#1e293b',
      300: '#475569',
      500: '#94a3b8',
      700: '#f1f5f9',
    },
    red: { 100: '#450a0a', 700: '#fca5a5' },
    teal: { 600: '#5eead4' },
    white: '#0f172a',
  },
  ...BRAND_PALETTES,
} as const satisfies Record<string, IPalette>;
