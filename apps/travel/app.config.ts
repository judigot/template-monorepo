import type { ConfigContext, ExpoConfig } from 'expo/config';

const DEV_VARIANT = 'development';

export function resolveAppConfig(
  config: Partial<ExpoConfig>,
  variant: string | undefined,
): ExpoConfig {
  const isDevelopment = variant === DEV_VARIANT;

  return {
    ...config,
    name: isDevelopment ? 'Wanderapp Dev' : 'Wanderapp',
    slug: config.slug ?? 'travel-demo',
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

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant: unknown = process.env.EXPO_APP_VARIANT;
  return resolveAppConfig(
    config,
    typeof variant === 'string' ? variant : undefined,
  );
};
