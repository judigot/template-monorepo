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
      <YStack backgroundColor="#163e35" rounded={26} padding="5" gap="3">
        <Text color="#b6decf" fontSize={12} fontWeight="700" letterSpacing={2}>
          ROAM / TRAVEL JOURNAL
        </Text>
        <Text
          color="#ffffff"
          fontSize={compact ? 32 : 42}
          fontWeight="800"
          style={{ lineHeight: compact ? 40 : 50 }}
        >
          Your next great story starts somewhere.
        </Text>
        <Text color="#d4e9dc" fontSize={15} lineHeight="23px">
          Find a place worth exploring, then keep your favorites together.
        </Text>
      </YStack>

      <YStack gap="3">
        <Text fontSize={20} fontWeight="800" style={{ color: COLORS.ink }}>
          Find your kind of escape
        </Text>
        <Input
          size="md"
          value={query}
          onChangeText={setQuery}
          placeholder="Search destinations or experiences"
          accessibilityLabel="Search destinations"
          backgroundColor="#ffffff"
          rounded={14}
        / style={{ borderColor: COLORS.line }}>
        <XStack gap="2" flexWrap="wrap">
          {REGIONS.map(({ label, value }) => (
            <Button
              key={value}
              size="sm"
              rounded={100}
              borderWidth={1}
              onPress={() => {
                setRegion(value);
              }}
              accessibilityState={{ selected: region === value }}
             style={{ backgroundColor: region === value ? COLORS.accent : COLORS.surface, color: region === value ? COLORS.surface : COLORS.ink, borderColor: region === value ? COLORS.accent : COLORS.line }}>
              {label}
            </Button>
          ))}
        </XStack>
      </YStack>

      <YStack gap="3">
        <XStack items="center" justify="space-between">
          <Text fontSize={21} fontWeight="800" style={{ color: COLORS.ink }}>
            Discover places
          </Text>
          <Text fontSize={13} style={{ color: COLORS.muted }}>
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
          <XStack flexWrap="wrap" justify="space-between">
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
