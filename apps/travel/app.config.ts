import type { ConfigContext, ExpoConfig } from 'expo/config';

const DEV_VARIANT = 'development';

export function resolveAppConfig(
  config: ExpoConfig,
  variant: string | undefined,
): ExpoConfig {
  const isDevelopment = variant === DEV_VARIANT;

  return {
    ...config,
    name: isDevelopment ? 'Roam Travel Dev' : 'Roam Travel',
    scheme: isDevelopment ? 'roamtravel-dev' : 'roamtravel',
    ios: {
      ...config.ios,
      bundleIdentifier: isDevelopment
        ? 'com.judigot.roamtravel.dev'
        : 'com.judigot.roamtravel',
    },
    android: {
      ...config.android,
      package: isDevelopment
        ? 'com.judigot.roamtravel.dev'
        : 'com.judigot.roamtravel',
    },
    plugins: [...(config.plugins ?? []), 'expo-dev-client'],
  };
}

export default ({ config }: ConfigContext): ExpoConfig =>
  resolveAppConfig(config, process.env.EXPO_APP_VARIANT);
