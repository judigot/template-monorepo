import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, YStack } from 'tamagui';
import { COLORS } from '../theme';

export function Page({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: COLORS.canvas }}
    >
      <ScrollView
        flex={1}
        backgroundColor={COLORS.canvas}
        keyboardShouldPersistTaps="handled"
      >
        <YStack
          alignSelf="center"
          width="100%"
          maxWidth={1120}
          paddingHorizontal="$4"
          paddingTop="$5"
          paddingBottom="$8"
          gap="$5"
        >
          {children}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
