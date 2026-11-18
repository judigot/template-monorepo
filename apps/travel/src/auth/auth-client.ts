import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

/*
 * Only the public API origin belongs in an Expo client bundle.
 * The Google client secret and Better Auth secret stay in the Hono API.
 */
const origin = process.env.EXPO_PUBLIC_API_URL?.trim();

export const authBaseUrl =
  origin !== undefined &&
  (origin.startsWith('https://') || origin.startsWith('http://localhost:'))
    ? origin.replace(/\/$/, '')
    : null;

export const authClient = createAuthClient({
  baseURL: authBaseUrl ?? 'http://localhost:3000',
  plugins: [
    expoClient({
      scheme: 'roamtravel',
      storagePrefix: 'roamtravel',
      storage: SecureStore,
    }),
  ],
});
