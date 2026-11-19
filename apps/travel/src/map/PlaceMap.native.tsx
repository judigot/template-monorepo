import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { type IPlaceMapProps, MAP_STYLE, MAP_ZOOM, PIN_COLOR } from './place';

export function PlaceMap({ place, onOpen, onError }: IPlaceMapProps) {
  const center: [number, number] = [place.longitude, place.latitude];

  return (
    <Map
      style={styles.map}
      mapStyle={MAP_STYLE}
      onDidFailLoadingMap={onError}
      accessibilityLabel={`Map of ${place.locality}`}
    >
      <Camera initialViewState={{ center, zoom: MAP_ZOOM }} />
      <Marker lngLat={center} anchor="bottom">
        <Pressable
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={`Open ${place.name}`}
          style={styles.target}
        >
          <View style={styles.pin}>
            <View style={styles.center} />
          </View>
        </Pressable>
      </Marker>
    </Map>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  target: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderBottomRightRadius: 2,
    backgroundColor: PIN_COLOR,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  center: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
});
