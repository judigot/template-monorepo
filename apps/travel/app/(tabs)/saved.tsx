import { useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import { DestinationCard } from '../../src/components/DestinationCard';
import { EmptyState } from '../../src/components/EmptyState';
import { Page } from '../../src/components/Page';
import { DESTINATIONS } from '../../src/data/destinations';
import { useTravel } from '../../src/state/travel-context';
import { COLORS } from '../../src/theme';

export default function SavedScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { savedIds, isSaved, toggleSaved } = useTravel();
  const savedDestinations = DESTINATIONS.filter(({ id }) =>
    savedIds.includes(id),
  );

  return (
    <Page>
      <YStack gap="$2" paddingVertical="$3">
        <Text
          fontSize={12}
          fontWeight="800"
          letterSpacing={2}
          color={COLORS.accent}
        >
          YOUR COLLECTION
        </Text>
        <Text fontSize={34} fontWeight="800" color={COLORS.ink}>
          Saved places
        </Text>
        <Text fontSize={15} color={COLORS.muted}>
          A little inspiration for the journeys ahead.
        </Text>
      </YStack>
      {savedDestinations.length === 0 ? (
        <EmptyState
          title="Your list is just getting started"
          message="Tap the heart on any destination to keep it here."
          actionLabel="Find places"
          onAction={() => {
            router.replace('/');
          }}
        />
      ) : (
        <YStack gap="$3">
          <Text fontSize={15} color={COLORS.muted}>
            {savedDestinations.length} saved{' '}
            {savedDestinations.length === 1 ? 'destination' : 'destinations'}
          </Text>
          <XStack flexWrap="wrap" justifyContent="space-between">
            {savedDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                compact={width < 720}
                saved={isSaved(destination.id)}
                onToggleSaved={toggleSaved}
              />
            ))}
          </XStack>
          <Button
            backgroundColor={COLORS.accentSoft}
            color={COLORS.accent}
            onPress={() => {
              router.replace('/');
            }}
          >
            Discover more places
          </Button>
        </YStack>
      )}
    </Page>
  );
}
