import {
  type GeolocationPosition,
  LocationManager,
} from '@maplibre/maplibre-react-native';
import { Platform } from 'react-native';
import type { IMapLocation } from './current-location';

export async function getCurrentLocation(): Promise<IMapLocation> {
  if (!(await LocationManager.requestPermissions())) {
    throw new Error('Allow location access to center the map on you.');
  }

  return new Promise((resolve, reject) => {
    const onPosition = ({
      coords: { longitude, latitude },
      timestamp,
    }: GeolocationPosition) => {
      const timestampMs = Platform.OS === 'ios' ? timestamp * 1000 : timestamp;
      if (Date.now() - timestampMs > 30_000) {
        return;
      }
      clearTimeout(timeout);
      LocationManager.removeListener(onPosition);
      resolve({ longitude, latitude });
    };
    const timeout = setTimeout(() => {
      LocationManager.removeListener(onPosition);
      reject(
        new Error(
          'Could not find your location. Check your location settings and try again.',
        ),
      );
    }, 15_000);
    LocationManager.addListener(onPosition);
  });
}
