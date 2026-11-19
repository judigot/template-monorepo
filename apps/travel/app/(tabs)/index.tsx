import { Link } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import { EmptyState } from '../../src/components/EmptyState';
import { Page } from '../../src/components/Page';
import { DESTINATIONS, filterDestinations } from '../../src/data/destinations';
import { FeaturedPlace } from '../../src/map/FeaturedPlace';
import { useTravel } from '../../src/state/travel-context';
import { useTravelColors } from '../../src/theme';

export default function DiscoverScreen() {
  const colors = useTravelColors();
  const [query, setQuery] = useState('');
  const { isSaved, toggleSaved } = useTravel();
  const destinations = filterDestinations(DESTINATIONS, query, 'all');

  return (
    <Page>
      <YStack gap="2">
        <Text fontSize={24} fontWeight="800" style={{ color: colors.ink }}>
          Your next adventure
        </Text>
        <Input
          size="md"
          value={query}
          onChangeText={setQuery}
          placeholder="Search destinations"
          accessibilityLabel="Search destinations"
          style={{ backgroundColor: colors.surface, borderColor: colors.line }}
        />
      </YStack>

      <FeaturedPlace />

      {destinations.length === 0 ? (
        <EmptyState
          title="No matching destinations"
          message="Try a different search."
          actionLabel="Clear search"
          onAction={() => {
            setQuery('');
          }}
        />
      ) : (
        <YStack
          rounded={14}
          borderWidth={1}
          overflow="hidden"
          style={{ backgroundColor: colors.surface, borderColor: colors.line }}
        >
          {destinations.map((destination, index) => {
            const saved = isSaved(destination.id);

            return (
              <XStack
                key={destination.id}
                items="center"
                style={{
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderColor: colors.line,
                  paddingRight: 8,
                }}
              >
                <Link
                  href={{
                    pathname: '/destination/[id]',
                    params: { id: destination.id },
                  }}
                  asChild
                >
                  <Pressable
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      minHeight: 56,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Image
                      source={{ uri: destination.imageUrl }}
                      resizeMode="cover"
                      style={{
                        width: 48,
                        height: 44,
                        borderRadius: 8,
                        backgroundColor: colors.imageFallback,
                      }}
                    />
                    <YStack flex={1}>
                      <Text
                        fontSize={16}
                        fontWeight="700"
                        style={{ color: colors.ink }}
                      >
                        {destination.name}
                      </Text>
                      <Text fontSize={13} style={{ color: colors.muted }}>
                        {destination.country}
                      </Text>
                    </YStack>
                  </Pressable>
                </Link>
                <Button
                  w={44}
                  h={44}
                  circular
                  accessibilityLabel={
                    (saved ? 'Remove ' : 'Save ') + destination.name
                  }
                  accessibilityState={{ selected: saved }}
                  onPress={() => {
                    toggleSaved(destination.id);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    color: saved ? colors.saved : colors.ink,
                  }}
                >
                  {saved ? '♥' : '♡'}
                </Button>
              </XStack>
            );
          })}
        </YStack>
      )}
    </Page>
  );
}
