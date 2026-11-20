import {
  Camera,
  type CameraRef,
  Map,
  type MapRef,
  Marker,
} from '@maplibre/maplibre-react-native';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { type IExploreMapProps, MAP_STYLES } from './place';

export function PlaceMap({
  places,
  camera,
  onOpen,
  onViewChange,
  onError,
  dark,
  focus,
}: IExploreMapProps) {
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  useEffect(() => {
    if (focus !== null) {
      cameraRef.current?.flyTo({
        center: [focus.longitude, focus.latitude],
        zoom: 16,
        duration: 720,
      });
    }
  }, [focus]);
  return (
    <Map
      ref={mapRef}
      androidView="texture"
      style={styles.map}
      mapStyle={dark ? MAP_STYLES.dark : MAP_STYLES.light}
      onDidFailLoadingMap={onError}
      onRegionDidChange={(event) => {
        const { center, zoom, bounds } = event.nativeEvent;
        onViewChange({
          center: [center[0], center[1]],
          zoom,
          bounds: {
            west: bounds[0],
            south: bounds[1],
            east: bounds[2],
            north: bounds[3],
          },
        });
      }}
      accessibilityLabel="Interactive map of curated Cebu City places"
    >
      <Camera
        ref={cameraRef}
        initialViewState={{ center: camera.center, zoom: camera.zoom }}
      />
      {places.map((place) => (
        <Marker
          key={place.slug}
          lngLat={[place.longitude, place.latitude]}
          anchor="bottom"
        >
          <Pressable
            onPress={() => {
              onOpen(place);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Open ${place.name}`}
            style={[
              styles.marker,
              dark ? styles.markerDark : styles.markerLight,
            ]}
          >
            <Text style={styles.icon}>
              {place.iconKey === 'lechon' ? '🍖' : '📍'}
            </Text>
            <Text
              style={[
                styles.label,
                dark ? styles.labelDark : styles.labelLight,
              ]}
              numberOfLines={1}
            >
              {place.name.split(' ')[0]}
            </Text>
          </Pressable>
        </Marker>
      ))}
    </Map>
  );
}

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject },
  marker: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderColor: '#b4233d',
    borderWidth: 2,
    borderRadius: 22,
    gap: 4,
  },
  markerDark: { backgroundColor: '#142337', borderColor: '#4fd1c5' },
  markerLight: { backgroundColor: '#fff', borderColor: '#0f766e' },
  labelDark: { color: '#e8f7f4' },
  labelLight: { color: '#122b31' },
  icon: { fontSize: 20 },
  label: { color: '#27272a', fontWeight: '700', maxWidth: 90 },
});
