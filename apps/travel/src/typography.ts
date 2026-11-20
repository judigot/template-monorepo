import { Platform } from 'react-native';

// Native Android already uses Roboto. On web the same family is loaded by web-fonts.web.ts.
export const APP_FONT_FAMILY = Platform.select({
  android: 'Roboto',
  ios: 'System',
  web: 'Roboto, Arial, sans-serif',
});

export const TYPE_SCALE = {
  caption: 12,
  label: 14,
  body: 16,
  title: 20,
  heading: 26,
} as const;

export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const CONTROL_RADIUS = 12;
