import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Slider, Text, XStack, YStack } from 'tamagui';
import { authBaseUrl } from '../auth/auth-client';
import { useTravel } from '../state/travel-context';
import { useTravelColors } from '../theme';
import { useSystemScheme } from '../theme-scheme';
import {
  affordableItems,
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

const GOOGLE_MAPS_ICON =
  'https://www.gstatic.com/images/branding/product/1x/maps_48dp.png';
const INCREMENT = 50;
const MAX_BUDGET = 5000;

interface IMatch {
  place: ICuratedPlace;
  estimate: IGroupEstimate;
}

function DirectionsButton({
  url,
  compact = false,
}: {
  url: string;
  compact?: boolean;
}) {
  const colors = useTravelColors();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="Directions in Google Maps"
      onPress={() => {
        void Linking.openURL(url);
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: compact ? 10 : 14,
        minHeight: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.surface,
      }}
    >
      <Image
        source={{ uri: GOOGLE_MAPS_ICON }}
        style={{ width: 19, height: 19 }}
      />
      <Text
        fontSize={compact ? 12 : 13}
        fontWeight="700"
        style={{ color: colors.ink }}
      >
        Directions
      </Text>
    </Pressable>
  );
}

function VenueDetails({
  match,
  people,
  budget,
  saved,
  onSave,
  onClose,
  onLocate,
}: {
  match: IMatch | null;
  people: number;
  budget: number;
  saved: boolean;
  onSave: () => void;
  onClose: () => void;
  onLocate: () => void;
}) {
  const colors = useTravelColors();
  if (match === null) {
    return null;
  }
  const within = affordableItems(match.place, budget * 100, people);
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#0009',
          justifyContent: 'flex-end',
        }}
      >
        <SafeAreaView
          edges={['bottom']}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            maxHeight: '88%',
          }}
        >
          <XStack
            justify="space-between"
            items="center"
            style={{ padding: 20, paddingBottom: 10 }}
          >
            <Text
              fontSize={12}
              fontWeight="800"
              letterSpacing={1.5}
              style={{ color: colors.accent }}
            >
              VENUE DETAILS
            </Text>
            <Button
              size="sm"
              aria-label="Close place details"
              onPress={onClose}
            >
              Close
            </Button>
          </XStack>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 26,
              gap: 16,
            }}
          >
            <YStack gap="2">
              <Text
                fontSize={26}
                fontWeight="800"
                style={{ color: colors.ink }}
              >
                {match.place.name}
              </Text>
              <Text fontSize={13} style={{ color: colors.muted }}>
                {match.place.category ?? 'Restaurant'} · {match.place.address}
              </Text>
              <Text fontSize={14} style={{ color: colors.muted }}>
                {match.place.description}
              </Text>
            </YStack>
            <YStack
              gap="2"
              style={{
                padding: 18,
                borderRadius: 18,
                backgroundColor: colors.accentSoft,
              }}
            >
              <Text
                fontSize={12}
                fontWeight="700"
                style={{ color: colors.accent }}
              >
                ESTIMATED GROUP TOTAL
              </Text>
              <Text
                fontSize={29}
                fontWeight="800"
                style={{ color: colors.ink }}
              >
                {pesos(match.estimate.totalCentavos)}
              </Text>
              <Text fontSize={13} style={{ color: colors.ink }}>
                {String(people)} {people === 1 ? 'person' : 'people'} ·{' '}
                {orderSummary(match.estimate)}
              </Text>
              <Text fontSize={11} style={{ color: colors.muted }}>
                Menu-only estimate. Serving assumptions are disclosed. Delivery,
                transport, and other charges excluded.
              </Text>
            </YStack>
            <XStack gap="2" flexWrap="wrap">
              <Button
                onPress={onLocate}
                style={{
                  backgroundColor: colors.accentSoft,
                  color: colors.accent,
                }}
              >
                Locate on map
              </Button>
              <DirectionsButton url={match.place.directionsUrl} />
              <Button onPress={onSave} style={{ color: colors.accent }}>
                {saved ? '♥ Saved' : '♡ Save place'}
              </Button>
            </XStack>
            <Text fontSize={19} fontWeight="800" style={{ color: colors.ink }}>
              Menu and prices
            </Text>
            <Text fontSize={12} style={{ color: colors.muted }}>
              Prices from the August 2026 menu photo or more recent venue
              updates.
            </Text>
            {match.place.menuItems
              .filter((item) => item.available !== false)
              .map((item) => {
                const affordable = within.some(
                  ({ item: candidate }) => candidate.id === item.id,
                );
                return (
                  <XStack
                    key={item.id}
                    justify="space-between"
                    items="center"
                    gap="3"
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderColor: colors.line,
                    }}
                  >
                    <YStack flex={1} gap="1">
                      <Text
                        fontSize={14}
                        fontWeight="700"
                        style={{ color: colors.ink }}
                      >
                        {item.name}
                        {item.variant === null ? '' : ` · ${item.variant}`}
                      </Text>
                      <Text fontSize={12} style={{ color: colors.muted }}>
                        {item.serves === null
                          ? 'Serving size unconfirmed'
                          : `Serves ${String(item.serves)}`}
                        {affordable ? ' · Within budget' : ''}
                      </Text>
                    </YStack>
                    <Text
                      fontSize={15}
                      fontWeight="800"
                      style={{ color: affordable ? colors.accent : colors.ink }}
                    >
                      {item.priceCentavos === null
                        ? 'Ask venue'
                        : pesos(item.priceCentavos)}
                    </Text>
                  </XStack>
                );
              })}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function VenueCard({
  match,
  people,
  budget,
  saved,
  onSave,
  onSelect,
  onLocate,
}: {
  match: IMatch;
  people: number;
  budget: number;
  saved: boolean;
  onSave: () => void;
  onSelect: () => void;
  onLocate: () => void;
}) {
  const colors = useTravelColors();
  const matchedItems = affordableItems(match.place, budget * 100, people);
  return (
    <YStack
      gap="3"
      style={{
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 20,
        backgroundColor: colors.surface,
        padding: 16,
      }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onSelect}
        accessibilityLabel={`Open ${match.place.name}`}
      >
        <XStack justify="space-between" items="flex-start" gap="2">
          <YStack gap="1" flex={1}>
            <Text fontSize={17} fontWeight="800" style={{ color: colors.ink }}>
              {match.place.name}
            </Text>
            <Text fontSize={12} style={{ color: colors.muted }}>
              {match.place.category ?? 'Restaurant'} · {match.place.locality}
            </Text>
          </YStack>
          <Text fontWeight="800" fontSize={18} style={{ color: colors.accent }}>
            {pesos(match.estimate.totalCentavos)}
          </Text>
        </XStack>
        <Text fontSize={12} style={{ color: colors.muted, marginTop: 8 }}>
          Estimated for {String(people)} · {orderSummary(match.estimate)}
        </Text>
      </Pressable>
      {matchedItems.length > 0 ? (
        <YStack
          gap="2"
          style={{
            borderTopWidth: 1,
            borderColor: colors.line,
            paddingTop: 12,
          }}
        >
          <Text
            fontSize={11}
            fontWeight="800"
            letterSpacing={1}
            style={{ color: colors.muted }}
          >
            ITEMS WITHIN BUDGET
          </Text>
          {matchedItems.slice(0, 5).map(({ item, groupTotal, quantity }) => (
            <XStack
              key={item.id}
              gap="2"
              justify="space-between"
              items="center"
            >
              <Text
                flex={1}
                fontSize={12}
                style={{ color: colors.ink }}
                numberOfLines={1}
              >
                {item.name}
                {item.variant === null ? '' : ` · ${item.variant}`}
              </Text>
              <Text
                fontSize={12}
                fontWeight="700"
                style={{ color: colors.accent }}
              >
                {groupTotal === null
                  ? `${pesos(item.priceCentavos ?? 0)} each*`
                  : `${pesos(groupTotal)} · ${String(quantity)}×`}
              </Text>
            </XStack>
          ))}
          {matchedItems.some(({ groupTotal }) => groupTotal === null) ? (
            <Text fontSize={10} style={{ color: colors.muted }}>
              * Serving count not confirmed
            </Text>
          ) : null}
        </YStack>
      ) : null}
      <XStack gap="2" flexWrap="wrap">
        <Button
          size="sm"
          onPress={onLocate}
          style={{ backgroundColor: colors.accentSoft, color: colors.accent }}
          accessibilityLabel={`Show ${match.place.name} on map`}
        >
          ⌖ Show on map
        </Button>
        <DirectionsButton url={match.place.directionsUrl} compact />
        <Button
          size="sm"
          onPress={onSave}
          aria-label="Save venue"
          style={{ color: colors.accent }}
        >
          {saved ? '♥' : '♡'}
        </Button>
      </XStack>
    </YStack>
  );
}

export function FeaturedPlace() {
  const colors = useTravelColors();
  const scheme = useSystemScheme();
  const { width } = useWindowDimensions();
  const { explore, setExplore, isSaved, toggleSaved } = useTravel();
  const [places, setPlaces] = useState<readonly ICuratedPlace[]>(
    OFFLINE_CURATED_PLACES,
  );
  const [catalogStatus, setCatalogStatus] = useState<
    'loading' | 'live' | 'cached'
  >(authBaseUrl === null ? 'cached' : 'loading');
  const [retry, setRetry] = useState(0);
  const [mapFailed, setMapFailed] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<{
    longitude: number;
    latitude: number;
    request: number;
  } | null>(null);
  const [exactBudget, setExactBudget] = useState(String(explore.budget));

  const setBudget = useCallback(
    (amount: number) => {
      if (!Number.isFinite(amount)) {
        return;
      }
      const budget = Math.min(MAX_BUDGET, Math.max(0, Math.round(amount)));
      setExplore((previous) => ({ ...previous, budget }));
      setExactBudget(String(budget));
      setSelected(null);
    },
    [setExplore],
  );

  useEffect(() => {
    if (authBaseUrl === null) {
      return;
    }
    const abort = new AbortController();
    void fetchCuratedPlaces(authBaseUrl, abort.signal)
      .then((result) => {
        if (abort.signal.aborted) {
          return;
        }
        setPlaces(result);
        setCatalogStatus('live');
      })
      .catch(() => {
        if (!abort.signal.aborted) {
          setCatalogStatus('cached');
        }
      });
    return () => {
      abort.abort();
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

  const nearby = useMemo(
    () => places.filter((place) => inViewport(place, explore.camera.bounds)),
    [places, explore.camera.bounds],
  );
  const independentItems = useMemo(
    () =>
      nearby
        .flatMap((place) =>
          affordableItems(place, explore.budget * 100, explore.people)
            .filter(({ item }) => item.serves === null)
            .map(({ item }) => ({ place, item })),
        )
        .sort(
          (a, b) => (a.item.priceCentavos ?? 0) - (b.item.priceCentavos ?? 0),
        ),
    [nearby, explore.budget, explore.people],
  );
  const selectedMatch =
    matches.find(({ place }) => place.slug === selected) ?? null;
  const locate = (place: ICuratedPlace) => {
    setSelected(null);
    setFocus((previous) => ({
      longitude: place.longitude,
      latitude: place.latitude,
      request: (previous?.request ?? 0) + 1,
    }));
  };
  const reset = () => {
    setExplore((previous) => ({
      ...previous,
      camera: {
        center: [123.900296875, 10.3318875],
        zoom: 15.5,
        bounds: { west: 123.88, south: 10.315, east: 123.92, north: 10.35 },
      },
    }));
    setFocus(null);
    setMapFailed(false);
    setMapKey((previous) => previous + 1);
  };
  const onViewChange = useCallback(
    (camera: IExploreCamera) => {
      setExplore((previous) => ({ ...previous, camera }));
    },
    [setExplore],
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <YStack
        gap="3"
        style={{
          width: '100%',
          maxWidth: 1020,
          alignSelf: 'center',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
        <XStack justify="space-between" items="center">
          <YStack gap="1">
            <Text
              fontSize={11}
              fontWeight="800"
              letterSpacing={2}
              style={{ color: colors.accent }}
            >
              DISCOVER
            </Text>
            <Text fontSize={26} fontWeight="800" style={{ color: colors.ink }}>
              Explore Cebu
            </Text>
          </YStack>
          <Button
            size="sm"
            onPress={reset}
            style={{ backgroundColor: colors.surface, color: colors.ink }}
          >
            ⌖ Recenter
          </Button>
        </XStack>
        <YStack
          gap="3"
          style={{
            padding: 14,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.surface,
          }}
        >
          <XStack justify="space-between" items="center">
            <Text
              fontSize={12}
              fontWeight="700"
              style={{ color: colors.muted }}
            >
              Total group budget
            </Text>
            <Text fontSize={22} fontWeight="800" style={{ color: colors.ink }}>
              {pesos(explore.budget * 100)}
            </Text>
          </XStack>
          <XStack gap="3" items="center">
            <Button
              size="sm"
              accessibilityLabel="Decrease budget by 50 pesos"
              disabled={explore.budget <= 0}
              onPress={() => {
                setBudget(explore.budget - INCREMENT);
              }}
              style={{
                backgroundColor: colors.accentSoft,
                color: colors.accent,
              }}
            >
              − ₱50
            </Button>
            <YStack flex={1}>
              <Slider
                min={0}
                max={MAX_BUDGET}
                step={INCREMENT}
                value={[Math.round(explore.budget / INCREMENT) * INCREMENT]}
                onValueChange={(values) => {
                  setBudget(values[0] ?? 0);
                }}
                accessibilityLabel="Maximum total spend in Philippine pesos, 50 peso increments"
              >
                <Slider.Track>
                  <Slider.TrackActive />
                </Slider.Track>
                <Slider.Thumb index={0} circular />
              </Slider>
            </YStack>
            <Button
              size="sm"
              accessibilityLabel="Increase budget by 50 pesos"
              disabled={explore.budget >= MAX_BUDGET}
              onPress={() => {
                setBudget(explore.budget + INCREMENT);
              }}
              style={{
                backgroundColor: colors.accentSoft,
                color: colors.accent,
              }}
            >
              + ₱50
            </Button>
          </XStack>
          <XStack justify="space-between" items="center" gap="3">
            <Input
              size="sm"
              keyboardType="number-pad"
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
              accessibilityLabel="Exact budget in pesos"
              placeholder="Exact ₱ amount"
              flex={1}
            />
            <XStack items="center" gap="2">
              <Text
                fontSize={12}
                fontWeight="700"
                style={{ color: colors.muted }}
              >
                People
              </Text>
              <Button
                size="sm"
                accessibilityLabel="Remove one person"
                disabled={explore.people <= 1}
                onPress={() => {
                  setSelected(null);
                  setExplore((previous) => ({
                    ...previous,
                    people: Math.max(1, previous.people - 1),
                  }));
                }}
              >
                −
              </Button>
              <Text style={{ color: colors.ink }} fontWeight="800">
                {String(explore.people)}
              </Text>
              <Button
                size="sm"
                accessibilityLabel="Add one person"
                disabled={explore.people >= 20}
                onPress={() => {
                  setSelected(null);
                  setExplore((previous) => ({
                    ...previous,
                    people: Math.min(20, previous.people + 1),
                  }));
                }}
              >
                +
              </Button>
            </XStack>
          </XStack>
        </YStack>
      </YStack>
      <View
        style={{
          width: width > 1040 ? 990 : undefined,
          alignSelf: 'center',
          height: width > 800 ? 400 : 310,
          marginHorizontal: 16,
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: colors.imageFallback,
        }}
      >
        {mapFailed ? (
          <YStack
            flex={1}
            items="center"
            justify="center"
            gap="3"
            style={{ padding: 18 }}
          >
            <Text style={{ color: colors.muted }}>
              Map unavailable. Matching places remain listed below.
            </Text>
            <Button
              onPress={() => {
                setMapFailed(false);
                setMapKey((previous) => previous + 1);
              }}
            >
              Try map again
            </Button>
          </YStack>
        ) : (
          <PlaceMap
            key={mapKey}
            places={matches.map(({ place }) => place)}
            camera={explore.camera}
            dark={scheme === 'dark'}
            focus={focus}
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
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 18,
          paddingBottom: 32,
          gap: 14,
          maxWidth: 1020,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <XStack justify="space-between" items="center">
          <YStack gap="1">
            <Text fontSize={19} fontWeight="800" style={{ color: colors.ink }}>
              {String(matches.length)}{' '}
              {matches.length === 1 ? 'place' : 'places'} for your group
            </Text>
            <Text fontSize={12} style={{ color: colors.muted }}>
              Results follow the visible map and budget.
            </Text>
          </YStack>
          {catalogStatus !== 'live' ? (
            <Button
              size="sm"
              onPress={() => {
                setCatalogStatus('loading');
                setRetry((value) => value + 1);
              }}
            >
              {catalogStatus === 'loading' ? 'Syncing' : 'Retry'}
            </Button>
          ) : null}
        </XStack>
        {catalogStatus !== 'live' ? (
          <Text fontSize={12} style={{ color: colors.muted }}>
            {catalogStatus === 'loading'
              ? 'Refreshing venue menus…'
              : 'Offline menu snapshot. Live prices may differ.'}
          </Text>
        ) : null}
        {matches.length === 0 ? (
          <YStack
            gap="2"
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              padding: 18,
            }}
          >
            <Text fontSize={15} fontWeight="800" style={{ color: colors.ink }}>
              {nearby.length === 0
                ? 'No curated places in this area'
                : 'No restaurant covers this group budget'}
            </Text>
            <Text fontSize={12} style={{ color: colors.muted }}>
              Prices alone cannot confirm servings for the whole group.
            </Text>
            <Button
              size="sm"
              onPress={
                nearby.length === 0
                  ? reset
                  : () => {
                      setBudget(MAX_BUDGET);
                    }
              }
            >
              {nearby.length === 0 ? 'Explore Cebu City' : 'Increase budget'}
            </Button>
          </YStack>
        ) : (
          matches.map((match) => (
            <VenueCard
              key={match.place.slug}
              match={match}
              people={explore.people}
              budget={explore.budget}
              saved={isSaved(match.place.slug)}
              onSave={() => {
                toggleSaved(match.place.slug);
              }}
              onSelect={() => {
                setSelected(match.place.slug);
              }}
              onLocate={() => {
                locate(match.place);
              }}
            />
          ))
        )}
        {independentItems.length > 0 ? (
          <YStack gap="3" style={{ paddingTop: 8 }}>
            <Text fontWeight="800" fontSize={18} style={{ color: colors.ink }}>
              Individual menu prices in budget
            </Text>
            <Text fontSize={12} style={{ color: colors.muted }}>
              The items below have a listed unit price within your budget, but
              their serving sizes are unconfirmed. They do not qualify the
              restaurant for your full group.
            </Text>
            {independentItems.slice(0, 12).map(({ place, item }) => (
              <XStack
                key={`${place.slug}:${item.id}`}
                items="center"
                justify="space-between"
                gap="3"
                style={{
                  paddingVertical: 11,
                  borderBottomWidth: 1,
                  borderColor: colors.line,
                }}
              >
                <YStack flex={1} gap="1">
                  <Text
                    fontSize={13}
                    fontWeight="700"
                    style={{ color: colors.ink }}
                  >
                    {item.name}
                    {item.variant === null ? '' : ` · ${item.variant}`}
                  </Text>
                  <Text fontSize={11} style={{ color: colors.muted }}>
                    {place.name}
                  </Text>
                </YStack>
                <Text fontWeight="800" style={{ color: colors.accent }}>
                  {pesos(item.priceCentavos ?? 0)}
                </Text>
              </XStack>
            ))}
          </YStack>
        ) : null}
      </ScrollView>
      <VenueDetails
        match={selectedMatch}
        people={explore.people}
        budget={explore.budget}
        saved={selectedMatch !== null && isSaved(selectedMatch.place.slug)}
        onSave={() => {
          if (selectedMatch !== null) {
            toggleSaved(selectedMatch.place.slug);
          }
        }}
        onClose={() => {
          setSelected(null);
        }}
        onLocate={() => {
          if (selectedMatch !== null) {
            locate(selectedMatch.place);
          }
        }}
      />
    </SafeAreaView>
  );
}
