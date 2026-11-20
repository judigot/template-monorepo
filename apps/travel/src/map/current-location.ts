export interface IMapLocation {
  longitude: number;
  latitude: number;
}

export async function getCurrentLocation(): Promise<IMapLocation> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    throw new Error('Location is unavailable in this browser.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { longitude, latitude } }) => {
        resolve({ longitude, latitude });
      },
      ({ code }) => {
        reject(
          new Error(
            code === 1
              ? 'Allow location access to center the map on you.'
              : 'Could not find your location. Check your location settings and try again.',
          ),
        );
      },
      { timeout: 15_000 },
    );
  });
}
