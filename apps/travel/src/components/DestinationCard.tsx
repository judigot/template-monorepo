import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import type { IDestination } from '../data/destinations';
import { COLORS } from '../theme';

export interface IDestinationCardProps {
  destination: IDestination;
  compact: boolean;
  saved: boolean;
  onToggleSaved: (id: string) => void;
}

export function DestinationCard({
  destination,
  compact,
  saved,
  onToggleSaved,
}: IDestinationCardProps) {
  const router = useRouter();

  return (
    <YStack
      width={compact ? '100%' : '48%'}
      backgroundColor={COLORS.surface}
      borderRadius={22}
      overflow="hidden"
      borderColor={COLORS.line}
      borderWidth={1}
      marginBottom="$3"
    >
      <YStack
        height={205}
        position="relative"
        backgroundColor={COLORS.imageFallback}
      >
        <Image
          source={{ uri: destination.imageUrl }}
          accessibilityLabel={destination.name + ' landscape'}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
        <Button
          position="absolute"
          top="$3"
          right="$3"
          size="$3"
          circular
          backgroundColor="#ffffff"
          color={saved ? '#be185d' : COLORS.ink}
          accessibilityLabel={(saved ? 'Remove ' : 'Save ') + destination.name}
          onPress={() => {
            onToggleSaved(destination.id);
          }}
        >
          {saved ? '♥' : '♡'}
        </Button>
      </YStack>
      <YStack padding="$4" gap="$2" flex={1}>
        <XStack alignItems="center" justifyContent="space-between" gap="$2">
          <Text fontSize={13} color={COLORS.accent} fontWeight="700">
            {destination.country.toUpperCase()}
          </Text>
          <Text fontSize={12} color={COLORS.muted}>
            {destination.duration}
          </Text>
        </XStack>
        <Text fontSize={24} color={COLORS.ink} fontWeight="800">
          {destination.name}
        </Text>
        <Text fontSize={14} color={COLORS.muted} lineHeight={21}>
          {destination.tagline}
        </Text>
        <XStack paddingTop="$2" marginTop="auto">
          <Button
            width="100%"
            backgroundColor={COLORS.accentSoft}
            color={COLORS.accent}
            fontWeight="700"
            onPress={() => {
              router.push({
                pathname: '/destination/[id]',
                params: { id: destination.id },
              });
            }}
          >
            Explore this place
          </Button>
        </XStack>
      </YStack>
    </YStack>
  );
}
