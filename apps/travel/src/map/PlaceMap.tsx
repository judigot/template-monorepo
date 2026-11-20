import 'maplibre-gl/dist/maplibre-gl.css';

import type { Marker as MapMarker, Map as MapView } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { type IExploreMapProps, MAP_STYLE } from './place';

export function PlaceMap({
  places,
  camera,
  onOpen,
  onViewChange,
  onError,
}: IExploreMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const onOpenRef = useRef(onOpen);
  const onViewChangeRef = useRef(onViewChange);
  const onErrorRef = useRef(onError);
  onOpenRef.current = onOpen;
  onViewChangeRef.current = onViewChange;
  onErrorRef.current = onError;

  useEffect(() => {
    const node = container.current;
    if (node === null) return;
    let disposed = false;
    void import('maplibre-gl')
      .then(({ getVersion, Map, NavigationControl, setWorkerUrl }) => {
        if (disposed) return;
        setWorkerUrl(
          `https://cdn.jsdelivr.net/npm/maplibre-gl@${getVersion()}/dist/maplibre-gl-worker.mjs`,
        );
        const map = new Map({
          container: node,
          style: MAP_STYLE,
          center: camera.center,
          zoom: camera.zoom,
          cooperativeGestures: false,
        });
        mapRef.current = map;
        setReady(true);
        const report = () => {
          const bounds = map.getBounds();
          const center = map.getCenter();
          onViewChangeRef.current({
            center: [center.lng, center.lat],
            zoom: map.getZoom(),
            bounds: {
              west: bounds.getWest(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              north: bounds.getNorth(),
            },
          });
        };
        map.on('load', report);
        map.on('moveend', report);
        map.on('error', () => {
          if (!map.isStyleLoaded()) onErrorRef.current();
        });
        map.addControl(new NavigationControl({ showCompass: false }));
      })
      .catch(() => {
        if (!disposed) onErrorRef.current();
      });
    return () => {
      disposed = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void import('maplibre-gl')
      .then(({ Marker }) => {
        if (cancelled) return;
        const map = mapRef.current;
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];
        if (map === null) return;
        for (const place of places) {
          const element = document.createElement('button');
          element.type = 'button';
          element.setAttribute('aria-label', `Open ${place.name}`);
          element.title = place.name;
          element.style.cssText =
            'background:#fff;border:2px solid #b4233d;border-radius:22px;padding:6px 10px;box-shadow:0 2px 8px #0003;cursor:pointer;font-size:14px;font-weight:700;white-space:nowrap';
          element.textContent = `${place.iconKey === 'lechon' ? '🍖' : '📍'} ${place.name.split(' ')[0]}`;
          element.addEventListener('click', () => onOpenRef.current(place));
          markersRef.current.push(
            new Marker({ element, anchor: 'bottom' })
              .setLngLat([place.longitude, place.latitude])
              .addTo(map),
          );
        }
      })
      .catch(() => onErrorRef.current());
    return () => {
      cancelled = true;
    };
  }, [places, ready]);

  return (
    <div
      ref={container}
      role="region"
      aria-label="Interactive map of curated Cebu City places"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
