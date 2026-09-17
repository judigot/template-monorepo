export interface IPalette {
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
} as const satisfies Record<string, IPalette>;
