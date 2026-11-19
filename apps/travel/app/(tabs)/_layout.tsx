import { Tabs } from 'expo-router';
import { useTravelColors } from '../../src/theme';

export default function TabLayout() {
  const colors = useTravelColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarIconStyle: { display: 'none' },
        tabBarLabelPosition: 'beside-icon',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          marginStart: 0,
          marginEnd: 0,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Explore' }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved places' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
