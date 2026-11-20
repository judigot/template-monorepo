import {
  Camera,
  Map,
  Marker,
  type MapRef,
} from '@maplibre/maplibre-react-native';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type IExploreMapProps, MAP_STYLE } from './place';

export function PlaceMap({
  places,
  camera,
  onOpen,
  onViewChange,
  onError,
}: IExploreMapProps) {
  const mapRef = useRef<MapRef>(null);
  return (
    <Map
      ref={mapRef}
      style={styles.map}
      mapStyle={MAP_STYLE}
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
      <Camera initialViewState={{ center: camera.center, zoom: camera.zoom }} />
      {places.map((place) => (
        <Marker
          key={place.slug}
          lngLat={[place.longitude, place.latitude]}
          anchor="bottom"
        >
          <Pressable
            onPress={() => onOpen(place)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${place.name}`}
            style={styles.marker}
          >
            <Text style={styles.icon}>
              {place.iconKey === 'lechon' ? '🍖' : '📍'}
            </Text>
            <Text style={styles.label} numberOfLines={1}>
              {place.name.split(' ')[0]}
            </Text>
          </Pressable>
        </Marker>
      ))}
    </Map>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
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
  icon: { fontSize: 20 },
  label: { color: '#27272a', fontWeight: '700', maxWidth: 90 },
});
