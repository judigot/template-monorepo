import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, H2, Input, Slider, Text, XStack, YStack } from 'tamagui';
import { authBaseUrl } from '../auth/auth-client';
import { useTravel } from '../state/travel-context';
import { useTravelColors } from '../theme';
import {
  fetchCuratedPlaces,
  type ICuratedPlace,
  inViewport,
  OFFLINE_CURATED_PLACES,
} from './catalog';
import {
  estimateGroup,
  type IGroupEstimate,
  orderSummary,
  pesos,
} from './estimate';
import { PlaceMap } from './PlaceMap';
import type { IExploreCamera } from './place';

interface IMatch {
  place: ICuratedPlace;
  estimate: IGroupEstimate;
}

function PlaceProfile({
  match,
  people,
  onClose,
}: {
  match: IMatch | null;
  people: number;
  onClose: () => void;
}) {
  const colors = useTravelColors();
  return (
    <Modal
      visible={match !== null}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {match === null ? null : (
        <View
          style={{
            flex: 1,
            backgroundColor: '#0009',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <YStack
            accessibilityViewIsModal
            rounded={20}
            gap="3"
            style={{
              backgroundColor: colors.surface,
              padding: 18,
              maxHeight: '88%',
              maxWidth: 650,
              width: '100%',
              alignSelf: 'center',
            }}
          >
            <ScrollView>
              <YStack gap="3">
                <H2 style={{ color: colors.ink }}>{match.place.name}</H2>
                <Text style={{ color: colors.muted }}>
                  {match.place.locality} · {match.place.address}
                </Text>
                <Text style={{ color: colors.ink }}>
                  {match.place.description}
                </Text>
                <Text fontWeight="800" style={{ color: colors.accent }}>
                  {pesos(match.estimate.totalCentavos)} for {people}{' '}
                  {people === 1 ? 'person' : 'people'}
                </Text>
                <Text style={{ color: colors.ink }}>
                  Estimated menu order: {orderSummary(match.estimate)}
                </Text>
                <Text fontSize={12} style={{ color: colors.muted }}>
                  Menu-based estimate only. Transportation and unlisted charges
                  are excluded. Individual value meals are assumed to serve one
                  diner.
                </Text>
                <Text
                  fontWeight="800"
                  fontSize={18}
                  style={{ color: colors.ink }}
                >
                  Menu · November 2026
                </Text>
                {match.place.menuItems.map((item) => (
                  <XStack key={item.id} justify="space-between" gap="2">
                    <YStack flex={1}>
                      <Text style={{ color: colors.ink }}>
                        {item.name}
                        {item.variant === null ? '' : ` · ${item.variant}`}
                      </Text>
                      <Text fontSize={12} style={{ color: colors.muted }}>
                        {item.serves === null
                          ? 'Serving count unknown'
                          : `Serves ${String(item.serves)} (${item.servingBasis})`}
                      </Text>
                    </YStack>
                    <Text fontWeight="700" style={{ color: colors.ink }}>
                      {item.priceCentavos === null
                        ? 'Price unknown'
                        : pesos(item.priceCentavos)}
                    </Text>
                  </XStack>
                ))}
                <Button
                  onPress={() => {
                    void Linking.openURL(match.place.directionsUrl);
                  }}
                  style={{
                    backgroundColor: colors.accentSoft,
                    color: colors.accent,
                  }}
                >
                  Open directions in Google Maps
                </Button>
              </YStack>
            </ScrollView>
            <Button onPress={onClose} accessibilityLabel="Close place details">
              Close
            </Button>
          </YStack>
        </View>
      )}
    </Modal>
  );
}

export function FeaturedPlace() {
  const colors = useTravelColors();
  const { explore, setExplore } = useTravel();
  const [places, setPlaces] = useState<readonly ICuratedPlace[]>(
    OFFLINE_CURATED_PLACES,
  );
  const [catalogStatus, setCatalogStatus] = useState<
    'cached' | 'live' | 'loading'
  >(authBaseUrl === null ? 'cached' : 'loading');
  const [retry, setRetry] = useState(0);
  const [mapFailed, setMapFailed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [exactBudget, setExactBudget] = useState(String(explore.budget));

  const setBudget = useCallback(
    (amount: number) => {
      if (!Number.isFinite(amount)) {
        return;
      }
      const budget = Math.min(5000, Math.max(0, Math.round(amount)));
      setExplore((previous) => ({ ...previous, budget }));
      setExactBudget(String(budget));
    },
    [setExplore],
  );

  useEffect(() => {
    if (authBaseUrl === null) {
      return;
    }
    const controller = new AbortController();
    void fetchCuratedPlaces(authBaseUrl, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }
        setPlaces(result);
        setCatalogStatus('live');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCatalogStatus('cached');
        }
      });
    return () => {
      controller.abort();
    };
  }, [retry]);

  const matches = useMemo(
    () =>
      places
        .flatMap((place) => {
          if (!inViewport(place, explore.camera.bounds)) {
            return [];
          }
          const estimate = estimateGroup(place.menuItems, explore.people);
          if (
            estimate === null ||
            estimate.totalCentavos > explore.budget * 100
          ) {
            return [];
          }
          return [{ place, estimate }];
        })
        .sort(
          (a, b) =>
            a.estimate.totalCentavos - b.estimate.totalCentavos ||
            a.place.name.localeCompare(b.place.name) ||
            a.place.slug.localeCompare(b.place.slug),
        ),
    [places, explore.budget, explore.people, explore.camera.bounds],
  );

  const availableMatches = useMemo(
    () => places.filter((place) => inViewport(place, explore.camera.bounds)),
    [places, explore.camera.bounds],
  );
  const selectedMatch =
    matches.find((match) => match.place.slug === selected) ?? null;

  const onViewChange = useCallback(
    (camera: IExploreCamera) => {
      setExplore((previous) => ({ ...previous, camera }));
    },
    [setExplore],
  );

  const resetCebu = () => {
    setExplore((previous) => ({
      ...previous,
      camera: {
        center: [123.900296875, 10.3318875],
        zoom: 15.5,
        bounds: { west: 123.88, south: 10.315, east: 123.92, north: 10.35 },
      },
    }));
    setMapFailed(false);
    setMapKey((key) => key + 1);
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <YStack
        gap="3"
        style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}
      >
        <Text fontSize={24} fontWeight="800" style={{ color: colors.ink }}>
          Explore Cebu City
        </Text>
        <XStack gap="3" items="center">
          <YStack flex={1} gap="2">
            <Text fontWeight="700" style={{ color: colors.ink }}>
              Total budget: {pesos(explore.budget * 100)}
            </Text>
            <Slider
              min={0}
              max={5000}
              step={10}
              value={[Math.round(explore.budget / 10) * 10]}
              onValueChange={(values) => {
                setBudget(values[0] ?? 0);
              }}
              accessibilityLabel="Maximum total budget in pesos"
            >
              <Slider.Track>
                <Slider.TrackActive />
              </Slider.Track>
              <Slider.Thumb index={0} circular />
            </Slider>
            <Input
              size="sm"
              keyboardType="numeric"
              value={exactBudget}
              onChangeText={(value) => {
                setExactBudget(value);
                if (/^\d{1,5}$/.test(value)) {
                  setBudget(Number(value));
                }
              }}
              onBlur={() => {
                setExactBudget(String(explore.budget));
              }}
              accessibilityLabel="Exact total budget in Philippine pesos"
              placeholder="Exact ₱ amount"
            />
          </YStack>
          <YStack gap="2" items="center">
            <Text fontWeight="700" style={{ color: colors.ink }}>
              People
            </Text>
            <XStack items="center" gap="2">
              <Button
                size="sm"
                accessibilityLabel="Remove one person"
                disabled={explore.people <= 1}
                onPress={() => {
                  setExplore((p) => ({
                    ...p,
                    people: Math.max(1, p.people - 1),
                  }));
                }}
              >
                −
              </Button>
              <Text
                accessibilityLabel={`${String(explore.people)} people`}
                style={{ color: colors.ink }}
              >
                {explore.people}
              </Text>
              <Button
                size="sm"
                accessibilityLabel="Add one person"
                disabled={explore.people >= 20}
                onPress={() => {
                  setExplore((p) => ({
                    ...p,
                    people: Math.min(20, p.people + 1),
                  }));
                }}
              >
                +
              </Button>
            </XStack>
          </YStack>
        </XStack>
      </YStack>
      <View
        style={{
          height: 310,
          marginHorizontal: 16,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: colors.imageFallback,
        }}
      >
        {mapFailed ? (
          <YStack
            flex={1}
            justify="center"
            items="center"
            gap="2"
            style={{ padding: 20 }}
          >
            <Text style={{ color: colors.muted }}>
              Map tiles unavailable. Showing results for your last known area.
            </Text>
            <Button
              onPress={() => {
                setMapFailed(false);
                setMapKey((key) => key + 1);
              }}
            >
              Retry map
            </Button>
          </YStack>
        ) : (
          <PlaceMap
            key={mapKey}
            places={matches.map(({ place }) => place)}
            camera={explore.camera}
            onViewChange={onViewChange}
            onOpen={(place) => {
              setSelected(place.slug);
            }}
            onError={() => {
              setMapFailed(true);
            }}
          />
        )}
      </View>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
      >
        <XStack justify="space-between" items="center">
          <Text fontSize={18} fontWeight="800" style={{ color: colors.ink }}>
            {matches.length} {matches.length === 1 ? 'place' : 'places'} in this
            area
          </Text>
          {catalogStatus !== 'live' && (
            <Button
              size="sm"
              onPress={() => {
                setCatalogStatus('loading');
                setRetry((value) => value + 1);
              }}
            >
              {catalogStatus === 'loading' ? 'Loading…' : 'Retry catalog'}
            </Button>
          )}
        </XStack>
        {catalogStatus !== 'live' && (
          <Text fontSize={12} style={{ color: colors.muted }}>
            {catalogStatus === 'loading'
              ? 'Updating curated catalog…'
              : 'Showing cached November 2026 menu. Live catalog unavailable.'}
          </Text>
        )}
        {matches.length === 0 ? (
          <YStack
            gap="2"
            rounded={14}
            style={{ backgroundColor: colors.surface, padding: 16 }}
          >
            <Text fontWeight="700" style={{ color: colors.ink }}>
              {availableMatches.length === 0
                ? 'No curated places in this area'
                : 'No places within your total budget'}
            </Text>
            <Button
              onPress={
                availableMatches.length === 0
                  ? resetCebu
                  : () => {
                      setBudget(5000);
                    }
              }
            >
              {availableMatches.length === 0
                ? 'Explore Cebu City'
                : 'Increase budget'}
            </Button>
          </YStack>
        ) : (
          matches.map((match) => (
            <Pressable
              key={match.place.slug}
              accessibilityRole="button"
              accessibilityLabel={`View ${match.place.name}, ${pesos(match.estimate.totalCentavos)} for ${String(explore.people)}`}
              onPress={() => {
                setSelected(match.place.slug);
              }}
            >
              <YStack
                rounded={14}
                gap="1"
                style={{
                  backgroundColor: colors.surface,
                  padding: 14,
                  borderColor: colors.line,
                  borderWidth: 1,
                }}
              >
                <Text fontWeight="800" style={{ color: colors.ink }}>
                  {match.place.name}
                </Text>
                <Text fontSize={13} style={{ color: colors.muted }}>
                  {match.place.locality}
                </Text>
                <Text fontWeight="700" style={{ color: colors.accent }}>
                  From {pesos(match.estimate.totalCentavos)} for{' '}
                  {explore.people} · {orderSummary(match.estimate)}
                </Text>
                <Text fontSize={12} style={{ color: colors.muted }}>
                  Menu-based estimate
                </Text>
              </YStack>
            </Pressable>
          ))
        )}
      </ScrollView>
      <PlaceProfile
        match={selectedMatch}
        people={explore.people}
        onClose={() => {
          setSelected(null);
        }}
      />
    </SafeAreaView>
  );
}
