import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import { TravelProvider } from '../src/state/travel-context';
import { useSystemScheme } from '../src/theme-scheme';
import { tamaguiConfig } from '../tamagui.config';

const managementTransition = { animation: 'slide_from_right' } as const;

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
                <Stack.Screen
                  name="manage/index"
                  options={managementTransition}
                />
                <Stack.Screen
                  name="manage/new"
                  options={managementTransition}
                />
                <Stack.Screen
                  name="manage/[slug]"
                  options={managementTransition}
                />
              </Stack>
            </TravelProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </Theme>
    </TamaguiProvider>
  );
}
