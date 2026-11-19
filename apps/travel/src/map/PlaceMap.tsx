import 'maplibre-gl/dist/maplibre-gl.css';

import type { Map as MapView } from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import { type IPlaceMapProps, MAP_STYLE, MAP_ZOOM, PIN_COLOR } from './place';

export function PlaceMap({ place, onOpen, onError }: IPlaceMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const { latitude, locality, longitude, name } = place;

  useEffect(() => {
    const node = container.current;
    if (node === null) {
      return;
    }

    let disposed = false;
    let map: MapView | undefined;
    const center: [number, number] = [longitude, latitude];

    void import('maplibre-gl')
      .then(({ Map, Marker, NavigationControl }) => {
        if (disposed) {
          return;
        }

        map = new Map({
          container: node,
          style: MAP_STYLE,
          center,
          zoom: MAP_ZOOM,
          cooperativeGestures: true,
        });
        map.once('error', () => {
          if (map?.isStyleLoaded() !== true) {
            onError();
          }
        });
        map.addControl(new NavigationControl({ showCompass: false }));
        const marker = new Marker({ color: PIN_COLOR })
          .setLngLat(center)
          .addTo(map);
        const pin = marker.getElement();
        pin.setAttribute('role', 'button');
        pin.setAttribute('aria-label', `Open ${name}`);
        pin.tabIndex = 0;
        pin.style.cursor = 'pointer';
        pin.addEventListener('click', onOpen);
        pin.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen();
          }
        });
      })
      .catch(() => {
        if (!disposed) {
          onError();
        }
      });

    return () => {
      disposed = true;
      map?.remove();
    };
  }, [latitude, longitude, name, onError, onOpen]);

  return (
    <div
      ref={container}
      aria-label={`Map of ${locality}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
