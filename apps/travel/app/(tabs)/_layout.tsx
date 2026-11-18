import { Tabs } from 'expo-router';
import { COLORS } from '../../src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 14, fontWeight: '700' },
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.line },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Explore' }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved places' }} />
    </Tabs>
  );
}
