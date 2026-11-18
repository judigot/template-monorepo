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
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: COLORS.canvas }}
      >
        <YStack
          w="100%"
          gap="5"
          style={{
            alignSelf: 'center',
            maxWidth: 1120,
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 32,
          }}
        >
          {children}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
