import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, useWindowDimensions } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import { EmptyState } from '../../src/components/EmptyState';
import { Page } from '../../src/components/Page';
import { getDestination } from '../../src/data/destinations';
import { useTravel } from '../../src/state/travel-context';
import { COLORS } from '../../src/theme';

export default function DestinationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isSaved, toggleSaved } = useTravel();
  const destination = getDestination(id);

  if (destination === undefined) {
    return (
      <Page>
        <EmptyState
          title="We could not find that place"
          message="The destination may have moved."
          actionLabel="Return to Explore"
          onAction={() => router.replace('/')}
        />
      </Page>
    );
  }

  const saved = isSaved(destination.id);

  return (
    <Page>
      <Button
        alignSelf="flex-start"
        size="$3"
        backgroundColor={COLORS.accentSoft}
        color={COLORS.accent}
        onPress={() => router.back()}
      >
        Back to places
      </Button>
      <YStack
        borderRadius={24}
        overflow="hidden"
        backgroundColor={COLORS.imageFallback}
      >
        <Image
          source={{ uri: destination.imageUrl }}
          resizeMode="cover"
          accessibilityLabel={destination.name + ' landscape'}
          style={{ width: '100%', height: width < 720 ? 230 : 355 }}
        />
      </YStack>
      <YStack gap="$3">
        <Text
          fontSize={13}
          fontWeight="800"
          color={COLORS.accent}
          letterSpacing={1}
        >
          {destination.country.toUpperCase()}
        </Text>
        <Text
          fontSize={width < 720 ? 34 : 46}
          fontWeight="800"
          color={COLORS.ink}
        >
          {destination.name}
        </Text>
        <Text fontSize={17} color={COLORS.muted} lineHeight={26}>
          {destination.description}
        </Text>
        <XStack flexWrap="wrap" gap="$3" paddingTop="$2">
          <YStack
            backgroundColor={COLORS.surface}
            padding="$4"
            borderRadius={16}
            flex={1}
          >
            <Text fontSize={12} color={COLORS.muted}>
              Best for
            </Text>
            <Text fontWeight="700" fontSize={15} color={COLORS.ink}>
              {destination.bestFor}
            </Text>
          </YStack>
          <YStack
            backgroundColor={COLORS.surface}
            padding="$4"
            borderRadius={16}
            flex={1}
          >
            <Text fontSize={12} color={COLORS.muted}>
              Suggested stay
            </Text>
            <Text fontWeight="700" fontSize={15} color={COLORS.ink}>
              {destination.duration}
            </Text>
          </YStack>
        </XStack>
      </YStack>
      <YStack
        gap="$3"
        padding="$5"
        borderRadius={22}
        backgroundColor={COLORS.surface}
      >
        <Text fontSize={21} fontWeight="800" color={COLORS.ink}>
          Ideas for your trip
        </Text>
        {destination.highlights.map((highlight, index) => (
          <XStack key={highlight} alignItems="flex-start" gap="$3">
            <YStack
              width={28}
              height={28}
              borderRadius={14}
              backgroundColor={COLORS.accentSoft}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontWeight="800" color={COLORS.accent}>
                {index + 1}
              </Text>
            </YStack>
            <Text color={COLORS.ink} fontSize={15} lineHeight={25} flex={1}>
              {highlight}
            </Text>
          </XStack>
        ))}
      </YStack>
      <Button
        size="$5"
        backgroundColor={saved ? COLORS.accentSoft : COLORS.accent}
        color={saved ? COLORS.accent : COLORS.surface}
        onPress={() => toggleSaved(destination.id)}
      >
        {saved ? 'Remove from saved places' : 'Save this destination'}
      </Button>
      <Text color={COLORS.muted} fontSize={12} textAlign="center">
        Demo content only. No live bookings or prices are shown.
      </Text>
    </Page>
  );
}
