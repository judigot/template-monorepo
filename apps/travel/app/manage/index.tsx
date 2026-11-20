import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import {
  addAdmin, getAccountAccess, getManagedPlaces,
  listAdmins, removeAdmin,
  type IAccountAccess, type IManagedPlace,
} from '../../src/admin/api';
import { Page } from '../../src/components/Page';
import { useTravelColors } from '../../src/theme';

export default function ManageHome() {
  const router = useRouter();
  const colors = useTravelColors();
  const [access, setAccess] = useState<IAccountAccess | null>(null);
  const [places, setPlaces] = useState<IManagedPlace[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    void (async () => {
      try {
        const profile = await getAccountAccess();
        const venues = await getManagedPlaces();
        setAccess(profile);
        setPlaces(venues);
        setAdmins(profile.role === 'admin' ? await listAdmins() : []);
        setError(null);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not load management workspace.');
      }
    })();
  }, []);
  useFocusEffect(refresh);

  const inviteAdmin = async () => {
    setBusy(true);
    setError(null);
    try {
      await addAdmin(email.trim());
      setEmail('');
      setNotice('Administrator access granted. This person can sign in with the verified Google account.');
      refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not grant administrator access.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <YStack gap="1" style={{ paddingTop: 8 }}>
        <Text letterSpacing={1.6} fontSize={11} fontWeight="800" style={{ color: colors.accent }}>
          WANDERAPP WORKSPACE
        </Text>
        <Text fontWeight="800" fontSize={28} style={{ color: colors.ink }}>Manage places</Text>
        <Text fontSize={13} style={{ color: colors.muted }}>
          Venue details, menus, pricing, and authorized accounts.
        </Text>
      </YStack>
      {access !== null ? (
        <View style={{ alignSelf: 'flex-start', backgroundColor: colors.accentSoft, borderRadius: 10, padding: 9 }}>
          <Text fontSize={11} fontWeight="800" style={{ color: colors.accent }}>
            {access.role === 'admin' ? 'PLATFORM ADMINISTRATOR' :
              access.role === 'owner' ? 'VENUE OWNER' : 'NO MANAGEMENT ACCESS'}
          </Text>
        </View>
      ) : null}
      {error !== null ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text> : null}
      {notice !== null ? <Text style={{ color: colors.accent }}>{notice}</Text> : null}
      {access?.role === 'admin' ? (
        <Button
          onPress={() => { router.push('/manage/new'); }}
          style={{ backgroundColor: colors.accent, color: colors.onAccent }}
        >
          + Create a place
        </Button>
      ) : null}
      <YStack gap="3">
        <Text fontSize={18} fontWeight="800" style={{ color: colors.ink }}>
          {access?.role === 'admin' ? 'All venues' : 'Your assigned venues'}
        </Text>
        {places.length === 0 ? (
          <Text fontSize={13} style={{ color: colors.muted }}>
            No managed venues. An administrator can assign a restaurant owner by verified email.
          </Text>
        ) : places.map((place) => (
          <Pressable
            key={place.slug}
            accessibilityRole="button"
            accessibilityLabel={`Manage ${place.name}`}
            onPress={() => {
              router.push({ pathname: '/manage/[slug]', params: { slug: place.slug } });
            }}
            style={{
              padding: 16, borderRadius: 18, backgroundColor: colors.surface,
              borderWidth: 1, borderColor: colors.line,
            }}
          >
            <XStack justify="space-between" items="center" gap="2">
              <YStack gap="2" flex={1}>
                <Text fontWeight="800" fontSize={16} style={{ color: colors.ink }}>{place.name}</Text>
                <Text fontSize={12} style={{ color: colors.muted }}>
                  {place.category ?? 'Restaurant'} · {String(place.menuItems.length)} menu items
                </Text>
              </YStack>
              <Text fontSize={22} style={{ color: colors.accent }}>›</Text>
            </XStack>
          </Pressable>
        ))}
      </YStack>
      {access?.role === 'admin' ? (
        <YStack gap="3" style={{
          backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1,
          borderColor: colors.line, padding: 16,
        }}>
          <Text fontSize={18} fontWeight="800" style={{ color: colors.ink }}>
            Administrator access
          </Text>
          <Text fontSize={12} style={{ color: colors.muted }}>
            Add a trusted administrator using their verified Google email.
            Existing and invited accounts appear here.
          </Text>
          {admins.map((admin) => (
            <XStack key={admin} justify="space-between" items="center" gap="3">
              <Text flex={1} style={{ color: colors.ink }}>{admin}</Text>
              <Button
                size="sm"
                disabled={admin === 'judigot@gmail.com' || admin === access.email}
                onPress={() => {
                  void (async () => {
                    try {
                      await removeAdmin(admin);
                      refresh();
                    } catch (cause) {
                      setError(cause instanceof Error ? cause.message : 'Could not revoke access.');
                    }
                  })();
                }}
              >
                Revoke
              </Button>
            </XStack>
          ))}
          <Input
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel="New administrator email"
            placeholder="administrator@example.com"
            onChangeText={setEmail}
          />
          <Button
            disabled={busy || email.trim().length === 0}
            onPress={() => { void inviteAdmin(); }}
            style={{ backgroundColor: colors.accent, color: colors.onAccent }}
          >
            Grant administrator access
          </Button>
        </YStack>
      ) : null}
      <Button onPress={() => { router.back(); }}>Back to account</Button>
    </Page>
  );
}
