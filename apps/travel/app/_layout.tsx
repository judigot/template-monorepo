import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import { TravelProvider } from '../src/state/travel-context';
import { useSystemScheme } from '../src/theme-scheme';
import { tamaguiConfig } from '../tamagui.config';

export default function RootLayout() {
  const isDark = useSystemScheme() === 'dark';

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={isDark ? 'dark' : 'light'}
    >
      <Theme name={isDark ? 'dark' : 'light'}>
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
      </Theme>
    </TamaguiProvider>
  );
}
