import { describe, expect, it } from 'bun:test';
import type { ExpoConfig } from 'expo/config';
import { resolveAppConfig } from '../app.config';

const baseConfig: ExpoConfig = {
  name: 'Roam Travel',
  slug: 'travel-demo',
  scheme: 'roamtravel',
  android: { package: 'com.judigot.roamtravel' },
  ios: { bundleIdentifier: 'com.judigot.roamtravel' },
  plugins: ['expo-router'],
};

describe('native development variant', () => {
  it('installs alongside the release app with its own identity', () => {
    const config = resolveAppConfig(baseConfig, 'development');
    expect(config.name).toBe('Roam Travel Dev');
    expect(config.scheme).toBe('roamtravel-dev');
    expect(config.android?.package).toBe('com.judigot.roamtravel.dev');
    expect(config.ios?.bundleIdentifier).toBe('com.judigot.roamtravel.dev');
    expect(config.plugins).toContain('expo-router');
    expect(config.plugins).toContain('expo-dev-client');
  });

  it('preserves release IDs and scheme when not developing', () => {
    const config = resolveAppConfig(baseConfig, undefined);
    expect(config.name).toBe('Roam Travel');
    expect(config.scheme).toBe('roamtravel');
    expect(config.android?.package).toBe('com.judigot.roamtravel');
    expect(config.ios?.bundleIdentifier).toBe('com.judigot.roamtravel');
  });

  it('does not mutate the release configuration', () => {
    resolveAppConfig(baseConfig, 'development');
    expect(baseConfig.plugins).toEqual(['expo-router']);
    expect(baseConfig.android?.package).toBe('com.judigot.roamtravel');
  });
});
