import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import { authBaseUrl } from '../../src/auth/auth-client';
import { Page } from '../../src/components/Page';
import {
  fetchCuratedPlaces,
  type ICuratedPlace,
  OFFLINE_CURATED_PLACES,
} from '../../src/map/catalog';
import { useTravel } from '../../src/state/travel-context';
import { useTravelColors } from '../../src/theme';

export default function SavedScreen() {
  const router = useRouter();
  const colors = useTravelColors();
  const { savedIds, toggleSaved } = useTravel();
  const [places, setPlaces] = useState<readonly ICuratedPlace[]>(
    OFFLINE_CURATED_PLACES,
  );
  useEffect(() => {
    if (authBaseUrl === null) {
      return;
    }
    const abort = new AbortController();
    void fetchCuratedPlaces(authBaseUrl, abort.signal)
      .then((result) => {
        if (!abort.signal.aborted) {
          setPlaces(result);
        }
      })
      .catch(() => {
        // The bundled curated catalog remains available for an offline preview.
      });
    return () => {
      abort.abort();
    };
  }, []);
  const saved = places.filter((place) => savedIds.includes(place.slug));
  return (
    <Page>
      <YStack gap="1" style={{ paddingTop: 10 }}>
        <Text
          letterSpacing={1.7}
          fontSize={11}
          fontWeight="800"
          style={{ color: colors.accent }}
        >
          YOUR COLLECTION
        </Text>
        <Text fontSize={30} fontWeight="800" style={{ color: colors.ink }}>
          Saved places
        </Text>
        <Text fontSize={14} style={{ color: colors.muted }}>
          Restaurants and experiences worth returning to.
        </Text>
      </YStack>
      {saved.length === 0 ? (
        <YStack
          items="center"
          justify="center"
          gap="3"
          style={{
            padding: 30,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.surface,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              backgroundColor: colors.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text fontSize={32} style={{ color: colors.accent }}>
              ♡
            </Text>
          </View>
          <Text fontSize={19} fontWeight="800" style={{ color: colors.ink }}>
            Your collection starts here
          </Text>
          <Text
            fontSize={13}
            textAlign="center"
            style={{ color: colors.muted }}
          >
            Explore curated places and tap the save button to keep them handy.
          </Text>
          <Button
            onPress={() => {
              router.replace('/');
            }}
            style={{ backgroundColor: colors.accent, color: colors.onAccent }}
          >
            Explore places
          </Button>
        </YStack>
      ) : (
        <YStack gap="3">
          <Text fontSize={12} style={{ color: colors.muted }}>
            {String(saved.length)} {saved.length === 1 ? 'place' : 'places'}{' '}
            saved in this session
          </Text>
          {saved.map((place) => (
            <YStack
              key={place.slug}
              gap="3"
              style={{
                padding: 16,
                borderRadius: 20,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.line,
              }}
            >
              <XStack gap="3" items="center">
                <View
                  style={{
                    height: 56,
                    width: 56,
                    borderRadius: 17,
                    backgroundColor: colors.accentSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text fontSize={22} style={{ color: colors.accent }}>
                    {place.iconKey === 'lechon' ? '♨' : '⌖'}
                  </Text>
                </View>
                <YStack flex={1} gap="1">
                  <Text
                    fontSize={16}
                    fontWeight="800"
                    style={{ color: colors.ink }}
                  >
                    {place.name}
                  </Text>
                  <Text fontSize={12} style={{ color: colors.muted }}>
                    {place.category ?? 'Restaurant'} · {place.locality}
                  </Text>
                </YStack>
              </XStack>
              <Text fontSize={13} style={{ color: colors.muted }}>
                {place.description}
              </Text>
              <XStack gap="2" flexWrap="wrap">
                <Button
                  size="sm"
                  onPress={() => {
                    void Linking.openURL(place.directionsUrl);
                  }}
                  style={{
                    backgroundColor: colors.accentSoft,
                    color: colors.accent,
                  }}
                >
                  ↗ Google Maps directions
                </Button>
                <Button
                  size="sm"
                  onPress={() => {
                    toggleSaved(place.slug);
                  }}
                  style={{ color: colors.ink }}
                >
                  Remove saved place
                </Button>
              </XStack>
            </YStack>
          ))}
        </YStack>
      )}
      <Text fontSize={11} style={{ color: colors.muted }}>
        Saved places are stored in this app session. Account-based
        synchronization is planned separately.
      </Text>
    </Page>
  );
}
