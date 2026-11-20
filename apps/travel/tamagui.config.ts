import { defaultConfig } from '@tamagui/config/v6';
import { createTamagui } from 'tamagui';
import { APP_FONT_FAMILY } from './src/typography';

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  fonts: {
    ...defaultConfig.fonts,
    body: {
      ...defaultConfig.fonts.body,
      family: APP_FONT_FAMILY,
    },
    heading: {
      ...defaultConfig.fonts.heading,
      family: APP_FONT_FAMILY,
    },
  },
  settings: {
    ...defaultConfig.settings,
    defaultFont: 'body',
  },
});

export type ITravelTamaguiConfig = typeof tamaguiConfig;
