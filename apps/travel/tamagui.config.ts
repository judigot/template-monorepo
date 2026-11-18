import { defaultConfig } from '@tamagui/config/v6';
import { createTamagui } from 'tamagui';

export const tamaguiConfig = createTamagui(defaultConfig);

export type ITravelTamaguiConfig = typeof tamaguiConfig;

