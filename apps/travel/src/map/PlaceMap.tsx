import 'maplibre-gl/dist/maplibre-gl.css';

import type { Marker as MapMarker, Map as MapView } from 'maplibre-gl';
import mapPackage from 'maplibre-gl/package.json';
import { useEffect, useRef, useState } from 'react';
import { type IExploreMapProps, MAP_STYLES } from './place';

// Keep MapLibre's published renderer and its worker together as browser modules.
function loadRenderer(): Promise<typeof import('maplibre-gl')> {
  const url = `/maplibre/${mapPackage.version}/maplibre-gl.mjs`;
  return import(/* @metro-ignore */ url);
}

export function PlaceMap({
  places,
  camera,
  onOpen,
  onViewChange,
  onError,
  dark,
  focus,
}: IExploreMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const initialCamera = useRef(camera);
  const initialDark = useRef(dark);
  const activeStyle = useRef<string | null>(null);
  const onOpenRef = useRef(onOpen);
  const onViewChangeRef = useRef(onViewChange);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onOpenRef.current = onOpen;
    onViewChangeRef.current = onViewChange;
    onErrorRef.current = onError;
  }, [onOpen, onViewChange, onError]);

  useEffect(() => {
    const node = container.current;
    if (node === null) {
      return;
    }
    let disposed = false;
    void loadRenderer()
      .then(({ Map, NavigationControl }) => {
        if (disposed) {
          return;
        }
        const map = new Map({
          container: node,
          style: initialDark.current ? MAP_STYLES.dark : MAP_STYLES.light,
          center: initialCamera.current.center,
          zoom: initialCamera.current.zoom,
          cooperativeGestures: false,
        });
        mapRef.current = map;
        activeStyle.current = initialDark.current
          ? MAP_STYLES.dark
          : MAP_STYLES.light;
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
        map.on('error', (event) => {
          if (map.isStyleLoaded() !== true && !('tile' in event)) {
            console.warn('Explore map style failed to load', event.error);
            onErrorRef.current();
          }
        });
        map.on('load', report);
        map.on('moveend', report);
        map.addControl(new NavigationControl({ showCompass: false }));
      })
      .catch((error: unknown) => {
        if (!disposed) {
          console.warn('Explore map initialization failed', error);
          onErrorRef.current();
        }
      });
    return () => {
      disposed = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      activeStyle.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadRenderer()
      .then(({ Marker }) => {
        if (cancelled) {
          return;
        }
        const map = mapRef.current;
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];
        if (map === null) {
          return;
        }
        for (const place of places) {
          const element = document.createElement('button');
          element.type = 'button';
          element.setAttribute('aria-label', `Open ${place.name}`);
          element.title = place.name;
          element.style.cssText =
            (dark
              ? 'background:#142337;color:#f6fbfa;border:2px solid #4fd1c5;'
              : 'background:#fff;color:#122b31;border:2px solid #0f766e;') +
            'border-radius:24px;padding:7px 11px;box-shadow:0 3px 12px #0003;cursor:pointer;font-size:13px;font-weight:700;white-space:nowrap';
          element.textContent = `${place.iconKey === 'lechon' ? '🍖' : '📍'} ${place.name.split(' ')[0] ?? place.name}`;
          element.addEventListener('click', () => {
            onOpenRef.current(place);
          });
          markersRef.current.push(
            new Marker({ element, anchor: 'bottom' })
              .setLngLat([place.longitude, place.latitude])
              .addTo(map),
          );
        }
      })
      .catch(() => {
        onErrorRef.current();
      });
    return () => {
      cancelled = true;
    };
  }, [places, ready, dark]);

  useEffect(() => {
    const map = mapRef.current;
    const nextStyle = dark ? MAP_STYLES.dark : MAP_STYLES.light;
    if (map !== null && activeStyle.current !== nextStyle) {
      activeStyle.current = nextStyle;
      map.setStyle(nextStyle);
    }
  }, [dark, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (map !== null && focus !== null) {
      map.flyTo({
        center: [focus.longitude, focus.latitude],
        zoom: Math.max(16, map.getZoom()),
        duration: 720,
      });
    }
  }, [focus]);

  return (
    <section
      ref={container}
      aria-label="Interactive map of curated Cebu City places"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
