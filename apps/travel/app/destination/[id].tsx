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
          onAction={() => {
            router.replace('/');
          }}
        />
      </Page>
    );
  }

  const saved = isSaved(destination.id);

  return (
    <Page>
      <Button
        size="sm"
        onPress={() => {
          router.back();
        }}
        style={{ alignSelf: 'flex-start', backgroundColor: COLORS.accentSoft, color: COLORS.accent }}
      >
        Back to places
      </Button>
      <YStack
        rounded={24}
        overflow="hidden"
        style={{ backgroundColor: COLORS.imageFallback }}
      >
        <Image
          source={{ uri: destination.imageUrl }}
          resizeMode="cover"
          accessibilityLabel={destination.name + ' landscape'}
          style={{ width: '100%', height: width < 720 ? 230 : 355 }}
        />
      </YStack>
      <YStack gap="3">
        <Text
          fontSize={13}
          fontWeight="800"
          letterSpacing={1}
          style={{ color: COLORS.accent }}
        >
          {destination.country.toUpperCase()}
        </Text>
        <Text
          fontSize={width < 720 ? 34 : 46}
          fontWeight="800"
          style={{ color: COLORS.ink }}
        >
          {destination.name}
        </Text>
        <Text fontSize={17} lineHeight="26px" style={{ color: COLORS.muted }}>
          {destination.description}
        </Text>
        <XStack flexWrap="wrap" gap="3" style={{ paddingTop: 8 }}>
          <YStack
            rounded={16}
            flex={1}
            style={{ padding: 16, backgroundColor: COLORS.surface }}
          >
            <Text fontSize={12} style={{ color: COLORS.muted }}>
              Best for
            </Text>
            <Text fontWeight="700" fontSize={15} style={{ color: COLORS.ink }}>
              {destination.bestFor}
            </Text>
          </YStack>
          <YStack
            rounded={16}
            flex={1}
            style={{ padding: 16, backgroundColor: COLORS.surface }}
          >
            <Text fontSize={12} style={{ color: COLORS.muted }}>
              Suggested stay
            </Text>
            <Text fontWeight="700" fontSize={15} style={{ color: COLORS.ink }}>
              {destination.duration}
            </Text>
          </YStack>
        </XStack>
      </YStack>
      <YStack
        gap="3"
        rounded={22}
        style={{ padding: 20, backgroundColor: COLORS.surface }}
      >
        <Text fontSize={21} fontWeight="800" style={{ color: COLORS.ink }}>
          Ideas for your trip
        </Text>
        {destination.highlights.map((highlight, index) => (
          <XStack key={highlight} items="flex-start" gap="3">
            <YStack
              w={28}
              h={28}
              rounded={14}
              items="center"
              justify="center"
              style={{ backgroundColor: COLORS.accentSoft }}
            >
              <Text fontWeight="800" style={{ color: COLORS.accent }}>
                {index + 1}
              </Text>
            </YStack>
            <Text
              fontSize={15}
              lineHeight="25px"
              flex={1}
              style={{ color: COLORS.ink }}
            >
              {highlight}
            </Text>
          </XStack>
        ))}
      </YStack>
      <Button
        size="lg"
        onPress={() => {
          toggleSaved(destination.id);
        }}
        style={{
          backgroundColor: saved ? COLORS.accentSoft : COLORS.accent,
          color: saved ? COLORS.accent : COLORS.surface,
        }}
      >
        {saved ? 'Remove from saved places' : 'Save this destination'}
      </Button>
      <Text fontSize={12} style={{ textAlign: 'center', color: COLORS.muted }}>
        Demo content only. No live bookings or prices are shown.
      </Text>
    </Page>
  );
}
