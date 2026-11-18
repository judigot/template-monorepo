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
      w={compact ? '100%' : '48%'}
      rounded={22}
      overflow="hidden"
      borderWidth={1}
      marginBottom="3"
     style={{ backgroundColor: COLORS.surface, borderColor: COLORS.line }}>
      <YStack
        h={205}
        position="relative"
       style={{ backgroundColor: COLORS.imageFallback }}>
        <Image
          source={{ uri: destination.imageUrl }}
          accessibilityLabel={destination.name + ' landscape'}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
        <Button
          position="absolute"
          top="3"
          right="3"
          size="sm"
          circular
          backgroundColor="#ffffff"
          accessibilityLabel={(saved ? 'Remove ' : 'Save ') + destination.name}
          onPress={() => {
            onToggleSaved(destination.id);
          }}
         style={{ color: saved ? '#be185d' : COLORS.ink }}>
          {saved ? '♥' : '♡'}
        </Button>
      </YStack>
      <YStack padding="4" gap="2" flex={1}>
        <XStack items="center" justify="space-between" gap="2">
          <Text fontSize={13} fontWeight="700" style={{ color: COLORS.accent }}>
            {destination.country.toUpperCase()}
          </Text>
          <Text fontSize={12} style={{ color: COLORS.muted }}>
            {destination.duration}
          </Text>
        </XStack>
        <Text fontSize={24} fontWeight="800" style={{ color: COLORS.ink }}>
          {destination.name}
        </Text>
        <Text fontSize={14} lineHeight="21px" style={{ color: COLORS.muted }}>
          {destination.tagline}
        </Text>
        <XStack paddingTop="2" marginTop="auto">
          <Button
            w="100%"
            fontWeight="700"
            onPress={() => {
              router.push({
                pathname: '/destination/[id]',
                params: { id: destination.id },
              });
            }}
           style={{ backgroundColor: COLORS.accentSoft, color: COLORS.accent }}>
            Explore this place
          </Button>
        </XStack>
      </YStack>
    </YStack>
  );
}
