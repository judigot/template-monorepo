import type { ITravelTamaguiConfig } from '../tamagui.config';

declare module 'tamagui' {
  interface TamaguiCustomConfig extends ITravelTamaguiConfig {
    readonly themes: ITravelTamaguiConfig['themes'];
  }
}
