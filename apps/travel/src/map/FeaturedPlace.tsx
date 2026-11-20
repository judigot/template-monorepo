import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Input, Slider, Text, XStack, YStack } from 'tamagui';
import { authBaseUrl } from '../auth/auth-client';
import { TravelButton } from '../components/TravelButton';
import { useTravel } from '../state/travel-context';
import { useTravelColors } from '../theme';
import { useSystemScheme } from '../theme-scheme';
import {
  affordableItems,
  fetchCuratedPlaces,
  type ICuratedPlace,
  OFFLINE_CURATED_PLACES,
} from './catalog';
import { getCurrentLocation, type IMapLocation } from './current-location';
import {
  estimateGroup,
  type IGroupEstimate,
  orderSummary,
  pesos,
} from './estimate';
import { MenuHandle } from './MenuHandle';
import { PlaceMap } from './PlaceMap';
import type { IExploreCamera } from './place';
import { VenueDismissHandle } from './VenueDismissHandle';
import { VenueSheetBody } from './VenueSheetBody';

const GOOGLE_MAPS_ICON =
  'https://www.gstatic.com/images/branding/product/1x/maps_48dp.png';
const MAP_CREDITS = [
  { label: 'OpenFreeMap', url: 'https://openfreemap.org/' },
  { label: '© OpenMapTiles', url: 'https://openmaptiles.org/' },
  { label: '© OpenStreetMap', url: 'https://www.openstreetmap.org/copyright' },
];
const INCREMENT = 50;
const MAX_BUDGET = 5000;
const COLLAPSED_SHEET_HEIGHT = 46;
const AnimatedSafeAreaView = Reanimated.createAnimatedComponent(SafeAreaView);

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
  const scheme = useSystemScheme();
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
        style={{ color: scheme === 'dark' ? '#fff' : colors.ink }}
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
  match: IMatch;
  people: number;
  budget: number;
  saved: boolean;
  onSave: () => void;
  onClose: () => void;
  onLocate: () => void;
}) {
  const colors = useTravelColors();
  const offset = useSharedValue(0);
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.get() }],
  }));
  const within = affordableItems(match.place, budget * 100, people);
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <GestureHandlerRootView
        style={{
          flex: 1,
          backgroundColor: '#0009',
          justifyContent: 'flex-end',
        }}
      >
        <AnimatedSafeAreaView
          edges={['bottom']}
          style={[
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              maxHeight: '88%',
            },
            sheetStyle,
          ]}
        >
          <VenueDismissHandle offset={offset} onClose={onClose} />
          <VenueSheetBody offset={offset} onClose={onClose}>
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
              <TravelButton onPress={onLocate} tone="accent">
                Locate on map
              </TravelButton>
              <DirectionsButton url={match.place.directionsUrl} />
              <TravelButton onPress={onSave} labelColor={colors.accent}>
                {saved ? '♥ Saved' : '♡ Save place'}
              </TravelButton>
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
                      style={{
                        color: affordable ? colors.accent : colors.ink,
                      }}
                    >
                      {item.priceCentavos === null
                        ? 'Ask venue'
                        : pesos(item.priceCentavos)}
                    </Text>
                  </XStack>
                );
              })}
          </VenueSheetBody>
        </AnimatedSafeAreaView>
      </GestureHandlerRootView>
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
  const affordable = affordableItems(match.place, budget * 100, people);
  const groupItems = affordable.filter(({ groupTotal }) => groupTotal !== null);
  const individualItems = affordable.filter(
    ({ groupTotal }) => groupTotal === null,
  );
  return (
    <YStack
      testID={`venue-card-${match.place.slug}`}
      gap="3"
      style={{
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
      {groupItems.length > 0 ? (
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
          {groupItems.slice(0, 5).map(({ item, groupTotal, quantity }) => (
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
        </YStack>
      ) : null}
      {individualItems.length > 0 ? (
        <YStack
          gap="2"
          style={{
            borderTopWidth: 1,
            borderColor: colors.line,
            paddingTop: 12,
          }}
        >
          <Text fontSize={13} fontWeight="800" style={{ color: colors.ink }}>
            Individual menu prices in budget
          </Text>
          <Text fontSize={11} style={{ color: colors.muted }}>
            Listed prices per item. Serving sizes are unconfirmed.
          </Text>
          {individualItems.map(({ item }) => (
            <XStack
              key={item.id}
              gap="2"
              justify="space-between"
              items="center"
            >
              <Text flex={1} fontSize={12} style={{ color: colors.ink }}>
                {item.name}
                {item.variant === null ? '' : ` · ${item.variant}`}
              </Text>
              <Text
                fontSize={12}
                fontWeight="700"
                style={{ color: colors.accent }}
              >
                {pesos(item.priceCentavos ?? 0)}
              </Text>
            </XStack>
          ))}
        </YStack>
      ) : null}
      <XStack gap="2" flexWrap="wrap">
        <TravelButton
          size="sm"
          onPress={onLocate}
          tone="accent"
          aria-label={`Show ${match.place.name} on map`}
        >
          ⌖ Show on map
        </TravelButton>
        <DirectionsButton url={match.place.directionsUrl} compact />
        <TravelButton
          size="sm"
          onPress={onSave}
          aria-label="Save venue"
          labelColor={colors.accent}
        >
          {saved ? '♥' : '♡'}
        </TravelButton>
      </XStack>
    </YStack>
  );
}

export function FeaturedPlace() {
  const colors = useTravelColors();
  const scheme = useSystemScheme();
  const insets = useSafeAreaInsets();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetProgress] = useState(() => new Animated.Value(0));
  const { height } = useWindowDimensions();
  const sheetTravel = Math.max(1, Math.min(420, height * 0.45));
  const settleMenu = useCallback(
    (open: boolean) => {
      setMenuOpen(open);
      Animated.timing(sheetProgress, {
        toValue: open ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    },
    [sheetProgress],
  );
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
  const [userLocation, setUserLocation] = useState<IMapLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
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
    [places, explore.budget, explore.people],
  );
  const mapPlaces = useMemo(() => matches.map(({ place }) => place), [matches]);
  const selectedMatch =
    matches.find(({ place }) => place.slug === selected) ?? null;
  const locate = (place: ICuratedPlace) => {
    settleMenu(false);
    setSelected(null);
    setFocus((previous) => ({
      longitude: place.longitude,
      latitude: place.latitude,
      request: (previous?.request ?? 0) + 1,
    }));
  };
  const recenter = async () => {
    setLocating(true);
    setLocationError(null);
    try {
      const position = await getCurrentLocation();
      setUserLocation(position);
      setFocus((previous) => ({
        ...position,
        request: (previous?.request ?? 0) + 1,
      }));
    } catch (error) {
      setUserLocation(null);
      setLocationError(
        error instanceof Error
          ? error.message
          : 'Could not find your location.',
      );
    } finally {
      setLocating(false);
    }
  };
  const onViewChange = useCallback(
    (camera: IExploreCamera) => {
      setExplore((previous) => ({ ...previous, camera }));
    },
    [setExplore],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={StyleSheet.absoluteFill}>
        <PlaceMap
          key={mapKey}
          places={mapPlaces}
          camera={explore.camera}
          dark={scheme === 'dark'}
          focus={focus}
          userLocation={userLocation}
          onViewChange={onViewChange}
          onOpen={(place) => {
            setSelected(place.slug);
          }}
          onError={() => {
            setMapFailed(true);
          }}
        />
        {mapFailed ? (
          <YStack
            items="center"
            gap="2"
            style={{
              position: 'absolute',
              top: '46%',
              alignSelf: 'center',
              maxWidth: '90%',
              padding: 12,
              borderRadius: 14,
              backgroundColor: colors.surface,
            }}
          >
            <Text fontSize={12} style={{ color: colors.ink }}>
              Map could not load. Matching places are listed below.
            </Text>
            <TravelButton
              size="sm"
              tone="accent"
              onPress={() => {
                setMapFailed(false);
                setMapKey((previous) => previous + 1);
              }}
            >
              Retry map
            </TravelButton>
          </YStack>
        ) : null}
      </View>
      <YStack
        gap="3"
        style={{
          position: 'absolute',
          top: insets.top + 10,
          left: 12,
          right: 54,
          maxWidth: 420,
        }}
      >
        <XStack gap="2">
          <TravelButton
            size="sm"
            onPress={() => {
              setFiltersOpen(!filtersOpen);
            }}
            aria-label="Budget and people"
            aria-expanded={filtersOpen}
            tone="surface"
          >
            {pesos(explore.budget * 100)} · {String(explore.people)}{' '}
            {explore.people === 1 ? 'person' : 'people'}
          </TravelButton>
        </XStack>
        <YStack
          gap="3"
          style={{
            display: filtersOpen ? 'flex' : 'none',
            padding: 14,
            borderRadius: 20,
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
            <TravelButton
              size="sm"
              aria-label="Decrease budget by 50 pesos"
              disabled={explore.budget <= 0}
              onPress={() => {
                setBudget(explore.budget - INCREMENT);
              }}
              tone="accent"
            >
              − ₱50
            </TravelButton>
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
            <TravelButton
              size="sm"
              aria-label="Increase budget by 50 pesos"
              disabled={explore.budget >= MAX_BUDGET}
              onPress={() => {
                setBudget(explore.budget + INCREMENT);
              }}
              tone="accent"
            >
              + ₱50
            </TravelButton>
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
              <TravelButton
                size="sm"
                aria-label="Remove one person"
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
              </TravelButton>
              <Text style={{ color: colors.ink }} fontWeight="800">
                {String(explore.people)}
              </Text>
              <TravelButton
                size="sm"
                aria-label="Add one person"
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
              </TravelButton>
            </XStack>
          </XStack>
        </YStack>
      </YStack>
      <Animated.View
        style={{
          position: 'absolute',
          right: 12,
          bottom: sheetProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [
              COLLAPSED_SHEET_HEIGHT + 12,
              COLLAPSED_SHEET_HEIGHT + sheetTravel + 12,
            ],
          }),
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        {locationError === null ? null : (
          <Text
            accessibilityRole="alert"
            fontSize={12}
            style={{
              maxWidth: 240,
              padding: 8,
              borderRadius: 10,
              backgroundColor: colors.surface,
              color: colors.ink,
            }}
          >
            {locationError}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Center map on my location"
          accessibilityState={{
            busy: locating,
            disabled: locating || mapFailed,
          }}
          disabled={locating || mapFailed}
          onPress={() => {
            void recenter();
          }}
          style={({ pressed }) => ({
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 24,
            backgroundColor: pressed ? colors.accentSoft : colors.surface,
            opacity: mapFailed ? 0.5 : 1,
          })}
        >
          {locating ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.accent,
                }}
              />
            </View>
          )}
        </Pressable>
      </Animated.View>
      {mapFailed ? null : (
        <Animated.View
          style={{
            position: 'absolute',
            left: 8,
            bottom: sheetProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [
                COLLAPSED_SHEET_HEIGHT + 4,
                COLLAPSED_SHEET_HEIGHT + sheetTravel + 4,
              ],
            }),
            borderRadius: 6,
            backgroundColor: colors.surface,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <XStack gap="2">
            {MAP_CREDITS.map(({ label, url }) => (
              <Pressable
                key={url}
                accessibilityRole="link"
                onPress={() => {
                  void Linking.openURL(url);
                }}
              >
                <Text fontSize={10} style={{ color: colors.ink }}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </XStack>
        </Animated.View>
      )}
      <Animated.View
        testID="explore-results-drawer"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: sheetProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [
              COLLAPSED_SHEET_HEIGHT,
              COLLAPSED_SHEET_HEIGHT + sheetTravel,
            ],
          }),
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          overflow: 'hidden',
          backgroundColor: colors.resultsSurface,
        }}
      >
        <MenuHandle
          open={menuOpen}
          onToggle={() => {
            settleMenu(!menuOpen);
          }}
          onDrag={(dy) => {
            const start = menuOpen ? 1 : 0;
            sheetProgress.setValue(
              Math.max(0, Math.min(1, start - dy / sheetTravel)),
            );
          }}
          onRelease={(dy) => {
            settleMenu(Math.abs(dy) < 24 ? menuOpen : dy < 0);
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              marginBottom: 4,
              backgroundColor: colors.muted,
            }}
          />
          <Text
            fontWeight="700"
            style={{ color: scheme === 'dark' ? '#fff' : colors.ink }}
          >
            {String(matches.length)}{' '}
            {matches.length === 1 ? 'place fits' : 'places fit'} your budget
          </Text>
        </MenuHandle>
        <ScrollView
          style={{ flex: 1 }}
          aria-hidden={!menuOpen}
          importantForAccessibility={menuOpen ? 'auto' : 'no-hide-descendants'}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            gap: 14,
            maxWidth: 1020,
            width: '100%',
            alignSelf: 'center',
          }}
        >
          {catalogStatus !== 'live' ? (
            <XStack justify="space-between" items="center" gap="2">
              <Text flex={1} fontSize={12} style={{ color: colors.muted }}>
                {catalogStatus === 'loading'
                  ? 'Refreshing venue menus…'
                  : 'Offline menu snapshot. Live prices may differ.'}
              </Text>
              <TravelButton
                size="sm"
                tone="accent"
                disabled={catalogStatus === 'loading'}
                onPress={() => {
                  setCatalogStatus('loading');
                  setRetry((value) => value + 1);
                }}
              >
                {catalogStatus === 'loading' ? 'Syncing' : 'Retry'}
              </TravelButton>
            </XStack>
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
              <Text
                fontSize={15}
                fontWeight="800"
                style={{ color: colors.ink }}
              >
                No restaurant covers this group budget
              </Text>
              <Text fontSize={12} style={{ color: colors.muted }}>
                Prices alone cannot confirm servings for the whole group.
              </Text>
              <TravelButton
                size="sm"
                onPress={() => {
                  setBudget(MAX_BUDGET);
                }}
              >
                Increase budget
              </TravelButton>
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
        </ScrollView>
      </Animated.View>
      {selectedMatch === null ? null : (
        <VenueDetails
          key={selectedMatch.place.slug}
          match={selectedMatch}
          people={explore.people}
          budget={explore.budget}
          saved={isSaved(selectedMatch.place.slug)}
          onSave={() => {
            toggleSaved(selectedMatch.place.slug);
          }}
          onClose={() => {
            setSelected(null);
          }}
          onLocate={() => {
            locate(selectedMatch.place);
          }}
        />
      )}
    </View>
  );
}
