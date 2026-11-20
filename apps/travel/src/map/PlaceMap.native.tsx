import {
  Camera,
  type CameraRef,
  Map,
  type MapRef,
  Marker,
} from '@maplibre/maplibre-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  type IExploreMapProps,
  MAP_STYLES,
  PLACE_LABEL_MIN_ZOOM,
} from './place';

export function PlaceMap({
  places,
  camera,
  onOpen,
  onViewChange,
  onError,
  dark,
  focus,
  userLocation,
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
          id={place.slug}
          lngLat={[place.longitude, place.latitude]}
          anchor="bottom"
          accessibilityRole="button"
          accessibilityLabel={`Open ${place.name}`}
          onPress={() => {
            onOpen(place);
          }}
        >
          <View
            collapsable={false}
            pointerEvents="none"
            style={[
              styles.marker,
              dark ? styles.markerDark : styles.markerLight,
            ]}
          >
            <Text style={styles.icon}>
              {place.iconKey === 'lechon' ? '🍖' : '📍'}
            </Text>
            {camera.zoom >= PLACE_LABEL_MIN_ZOOM ? (
              <Text
                style={[
                  styles.label,
                  dark ? styles.labelDark : styles.labelLight,
                ]}
                numberOfLines={1}
              >
                {place.name.split(' ')[0]}
              </Text>
            ) : null}
          </View>
        </Marker>
      ))}
      {userLocation === null ? null : (
        <Marker
          id="wanderapp-current-location"
          lngLat={[userLocation.longitude, userLocation.latitude]}
          anchor="center"
          accessibilityRole="image"
          accessibilityLabel="Your current location"
        >
          <View
            collapsable={false}
            pointerEvents="none"
            style={styles.locationDot}
          />
        </Marker>
      )}
    </Map>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%' },
  locationDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderColor: '#fff',
    borderWidth: 3,
    backgroundColor: '#1a73e8',
  },
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
