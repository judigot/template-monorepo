import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import { TravelProvider } from '../src/state/travel-context';
import { tamaguiConfig } from '../tamagui.config';

export default function RootLayout() {
  const isDark = useColorScheme() === 'dark';

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={isDark ? 'dark' : 'light'}
    >
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <TravelProvider>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="destination/[id]" />
            </Stack>
          </TravelProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
