import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTravelColors } from '../../src/theme';
import { APP_FONT_FAMILY, FONT_WEIGHT } from '../../src/typography';

const icons = { index: '⌕', saved: '♡', account: '◉' } as const;

export default function TabLayout() {
  const colors = useTravelColors();
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: APP_FONT_FAMILY,
          fontSize: 11,
          fontWeight: FONT_WEIGHT.semibold,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          paddingTop: 6,
          paddingBottom: 6 + bottom,
          height: 62 + bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 25 }}>{icons.index}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>{icons.saved}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>{icons.account}</Text>
          ),
        }}
      />
    </Tabs>
  );
}
