import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-native';
import { Button, H2, ScrollView, Text, XStack, YStack } from 'tamagui';
import { authBaseUrl } from '../auth/auth-client';
import { useTravelColors } from '../theme';
import { PlaceMap } from './PlaceMap';
import { fetchFeaturedPlace, TATANGS } from './place';

export function FeaturedPlace() {
  const colors = useTravelColors();
  const [place, setPlace] = useState(TATANGS);
  const [open, setOpen] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const openProfile = useCallback(() => {
    setOpen(true);
  }, []);
  const closeProfile = useCallback(() => {
    setOpen(false);
  }, []);
  const showMapError = useCallback(() => {
    setMapFailed(true);
  }, []);

  useEffect(() => {
    if (authBaseUrl === null) {
      return;
    }
    const controller = new AbortController();
    void fetchFeaturedPlace(authBaseUrl, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setPlace(result);
        }
      })
      .catch(() => {
        // The bundled place profile remains available for the demo.
      });
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <YStack
      overflow="hidden"
      rounded={14}
      borderWidth={1}
      style={{ backgroundColor: colors.surface, borderColor: colors.line }}
    >
      {!mapFailed ? (
        <YStack h={340} style={{ backgroundColor: colors.imageFallback }}>
          <PlaceMap place={place} onOpen={openProfile} onError={showMapError} />
        </YStack>
      ) : (
        <Text style={{ color: colors.muted, padding: 16 }}>
          Map unavailable. You can still open the place profile for directions.
        </Text>
      )}
      <Button
        onPress={openProfile}
        aria-label={`View profile for ${place.name}`}
        style={{
          backgroundColor: colors.surface,
          color: colors.ink,
          margin: 8,
        }}
      >
        View place profile
      </Button>
      <Modal
        transparent
        animationType="fade"
        visible={open}
        onRequestClose={closeProfile}
      >
        <YStack
          flex={1}
          items="center"
          justify="center"
          style={{ backgroundColor: '#0009', padding: 20 }}
        >
          <YStack
            accessibilityViewIsModal
            gap="3"
            rounded={20}
            style={{
              backgroundColor: colors.surface,
              maxHeight: '90%',
              maxWidth: 520,
              padding: 20,
              width: '100%',
            }}
          >
            <ScrollView>
              <YStack gap="3">
                <Text style={{ color: colors.muted }}>{place.locality}</Text>
                <H2
                  fontSize={25}
                  fontWeight="800"
                  style={{ color: colors.ink }}
                >
                  {place.name}
                </H2>
                <Text style={{ color: colors.muted }}>{place.address}</Text>
                <Text style={{ color: colors.ink }}>{place.description}</Text>
                <XStack flexWrap="wrap" gap="2">
                  {place.badges.map(({ slug, label, edition, sourceUrl }) => {
                    const text =
                      edition === null ? label : `${label} ${String(edition)}`;
                    return (
                      <YStack
                        key={slug}
                        rounded={14}
                        style={{
                          backgroundColor: colors.accentSoft,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                        }}
                      >
                        {sourceUrl === null ? (
                          <Text style={{ color: colors.accent }}>{text}</Text>
                        ) : (
                          <Link
                            href={sourceUrl}
                            style={{ color: colors.accent }}
                          >
                            {text}
                          </Link>
                        )}
                      </YStack>
                    );
                  })}
                </XStack>
                <Link
                  href={place.directionsUrl}
                  style={{ color: colors.accent }}
                >
                  Open in Google Maps
                </Link>
              </YStack>
            </ScrollView>
            <Button
              onPress={closeProfile}
              style={{
                backgroundColor: colors.accentSoft,
                color: colors.accent,
              }}
            >
              Close
            </Button>
          </YStack>
        </YStack>
      </Modal>
    </YStack>
  );
}
