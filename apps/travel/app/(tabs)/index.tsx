import { useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import { DestinationCard } from '../../src/components/DestinationCard';
import { EmptyState } from '../../src/components/EmptyState';
import { Page } from '../../src/components/Page';
import type { Region } from '../../src/data/destinations';
import { DESTINATIONS, filterDestinations } from '../../src/data/destinations';
import { useTravel } from '../../src/state/travel-context';
import { COLORS } from '../../src/theme';

const REGIONS: readonly { label: string; value: Region }[] = [
  { label: 'Anywhere', value: 'all' },
  { label: 'Asia', value: 'asia' },
  { label: 'Europe', value: 'europe' },
];

export default function DiscoverScreen() {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<Region>('all');
  const { isSaved, toggleSaved } = useTravel();
  const compact = width < 720;

  const destinations = useMemo(
    () => filterDestinations(DESTINATIONS, query, region),
    [query, region],
  );

  return (
    <Page>
      <YStack backgroundColor="#163e35" borderRadius={26} padding="$5" gap="$3">
        <Text color="#b6decf" fontSize={12} fontWeight="700" letterSpacing={2}>
          ROAM / TRAVEL JOURNAL
        </Text>
        <Text
          color="#ffffff"
          fontSize={compact ? 32 : 42}
          fontWeight="800"
          lineHeight={compact ? 40 : 50}
        >
          Your next great story starts somewhere.
        </Text>
        <Text color="#d4e9dc" fontSize={15} lineHeight={23}>
          Find a place worth exploring, then keep your favorites together.
        </Text>
      </YStack>

      <YStack gap="$3">
        <Text fontSize={20} color={COLORS.ink} fontWeight="800">
          Find your kind of escape
        </Text>
        <Input
          size="$4"
          value={query}
          onChangeText={setQuery}
          placeholder="Search destinations or experiences"
          accessibilityLabel="Search destinations"
          backgroundColor="#ffffff"
          borderColor={COLORS.line}
          borderRadius={14}
        />
        <XStack gap="$2" flexWrap="wrap">
          {REGIONS.map(({ label, value }) => (
            <Button
              key={value}
              size="$3"
              backgroundColor={
                region === value ? COLORS.accent : COLORS.surface
              }
              color={region === value ? COLORS.surface : COLORS.ink}
              borderRadius={100}
              borderWidth={1}
              borderColor={region === value ? COLORS.accent : COLORS.line}
              onPress={() => setRegion(value)}
              accessibilityState={{ selected: region === value }}
            >
              {label}
            </Button>
          ))}
        </XStack>
      </YStack>

      <YStack gap="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize={21} color={COLORS.ink} fontWeight="800">
            Discover places
          </Text>
          <Text fontSize={13} color={COLORS.muted}>
            {destinations.length}{' '}
            {destinations.length === 1 ? 'place' : 'places'}
          </Text>
        </XStack>
        {destinations.length === 0 ? (
          <EmptyState
            title="No matching destinations"
            message="Try another place, activity, or region."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('');
              setRegion('all');
            }}
          />
        ) : (
          <XStack flexWrap="wrap" justifyContent="space-between">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                compact={compact}
                saved={isSaved(destination.id)}
                onToggleSaved={toggleSaved}
              />
            ))}
          </XStack>
        )}
      </YStack>
    </Page>
  );
}
