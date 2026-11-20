import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform, Pressable, View } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import { getAccountAccess, type IAccountAccess } from '../../src/admin/api';
import { getAccountCallbackURL } from '../../src/auth/account-callback';
import { authBaseUrl, authClient } from '../../src/auth/auth-client';
import { Page } from '../../src/components/Page';
import { useTravelColors } from '../../src/theme';

function RoleLabel({ access }: { access: IAccountAccess | null }) {
  const colors = useTravelColors();
  const label =
    access?.role === 'admin'
      ? 'PLATFORM ADMINISTRATOR'
      : access?.role === 'owner'
        ? 'VERIFIED VENUE OWNER'
        : access === null
          ? 'ACCOUNT MEMBER'
          : 'TRAVELER';
  return (
    <View
      style={{
        backgroundColor: colors.accentSoft,
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 9,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        fontSize={10}
        letterSpacing={1}
        fontWeight="800"
        style={{ color: colors.accent }}
      >
        {label}
      </Text>
    </View>
  );
}

function SettingsRow({
  title,
  description,
  symbol,
  onPress,
}: {
  title: string;
  description: string;
  symbol: string;
  onPress?: () => void;
}) {
  const colors = useTravelColors();
  return (
    <Pressable
      disabled={onPress === undefined}
      accessibilityRole={onPress === undefined ? 'text' : 'button'}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
      }}
    >
      <View
        style={{
          height: 42,
          width: 42,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.accentSoft,
        }}
      >
        <Text fontSize={20} style={{ color: colors.accent }}>
          {symbol}
        </Text>
      </View>
      <YStack flex={1} gap="1">
        <Text fontSize={15} fontWeight="700" style={{ color: colors.ink }}>
          {title}
        </Text>
        <Text fontSize={12} style={{ color: colors.muted }}>
          {description}
        </Text>
      </YStack>
      {onPress === undefined ? null : (
        <Text fontSize={22} style={{ color: colors.muted }}>
          ›
        </Text>
      )}
    </Pressable>
  );
}

function AuthenticatedAccount() {
  const colors = useTravelColors();
  const router = useRouter();
  const { data: session, isPending, refetch } = authClient.useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [access, setAccess] = useState<IAccountAccess | null>(null);
  const [accessError, setAccessError] = useState(false);

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [refresh]);

  const sessionUserId = session?.user.id;

  useEffect(() => {
    if (sessionUserId === undefined) {
      return;
    }
    let active = true;
    void getAccountAccess()
      .then((value) => {
        if (active) {
          setAccess(value);
          setAccessError(false);
        }
      })
      .catch(() => {
        if (active) {
          setAccess(null);
          setAccessError(true);
        }
      });
    return () => {
      active = false;
    };
  }, [sessionUserId]);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: getAccountCallbackURL(
          Platform.OS === 'web' ? window.location.origin : undefined,
        ),
      });
      if (result.error) {
        setError(result.error.message ?? 'Google sign-in did not complete.');
      } else {
        refresh();
      }
    } catch {
      setError('Unable to contact the sign-in service. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  const signOut = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(result.error.message ?? 'Could not sign out.');
      } else {
        setAccess(null);
        refresh();
      }
    } catch {
      setError('Unable to contact the sign-in service. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <YStack gap="1" style={{ paddingTop: 12 }}>
        <Text
          letterSpacing={1.5}
          fontSize={11}
          fontWeight="800"
          style={{ color: colors.accent }}
        >
          WANDERAPP
        </Text>
        <Text fontSize={30} fontWeight="800" style={{ color: colors.ink }}>
          Account
        </Text>
        <Text fontSize={14} style={{ color: colors.muted }}>
          Your profile, preferences, and workspace.
        </Text>
      </YStack>
      {isPending ? (
        <Text style={{ color: colors.muted }}>Checking your session…</Text>
      ) : session?.user ? (
        <YStack gap="4">
          <YStack
            gap="3"
            style={{
              padding: 20,
              borderRadius: 22,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <XStack gap="3" items="center">
              <View
                style={{
                  height: 64,
                  width: 64,
                  borderRadius: 22,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  fontWeight="800"
                  fontSize={27}
                  style={{ color: colors.onAccent }}
                >
                  {session.user.name.slice(0, 1).toUpperCase() || 'W'}
                </Text>
              </View>
              <YStack flex={1} gap="1">
                <Text
                  fontSize={20}
                  fontWeight="800"
                  style={{ color: colors.ink }}
                >
                  {session.user.name || 'Wanderapp member'}
                </Text>
                <Text fontSize={12} style={{ color: colors.muted }}>
                  {session.user.email}
                </Text>
              </YStack>
            </XStack>
            {accessError ? (
              <Text fontSize={12} style={{ color: colors.error }}>
                Unable to verify account permissions. Management controls are
                unavailable.
              </Text>
            ) : access !== null ? (
              <RoleLabel access={access} />
            ) : (
              <Text fontSize={12} style={{ color: colors.muted }}>
                Verifying permissions…
              </Text>
            )}
          </YStack>
          <YStack gap="1">
            <Text
              fontSize={12}
              fontWeight="800"
              letterSpacing={1.5}
              style={{ color: colors.muted }}
            >
              YOUR WORKSPACE
            </Text>
            <YStack
              style={{
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.line,
              }}
            >
              {access?.role === 'admin' || access?.role === 'owner' ? (
                <SettingsRow
                  title={
                    access.role === 'admin'
                      ? 'Manage all places'
                      : 'Manage my restaurants'
                  }
                  description="Update venue details, menus, and prices."
                  symbol="⌂"
                  onPress={() => {
                    router.push('/manage');
                  }}
                />
              ) : (
                <SettingsRow
                  title="Your places"
                  description="Explore and save places you love."
                  symbol="⌂"
                />
              )}
              {access?.role === 'admin' ? (
                <SettingsRow
                  title="People and access"
                  description="Add administrators and assign restaurant owners."
                  symbol="♙"
                  onPress={() => {
                    router.push('/manage');
                  }}
                />
              ) : null}
              <SettingsRow
                title="Appearance"
                description="Automatically follows your device theme."
                symbol="◐"
              />
              <SettingsRow
                title="Secure sign-in"
                description="Google account authentication."
                symbol="◇"
              />
            </YStack>
          </YStack>
          <Button
            disabled={busy}
            onPress={() => {
              void signOut();
            }}
            style={{
              backgroundColor: colors.surface,
              color: colors.ink,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            {busy ? 'Signing out…' : 'Sign out'}
          </Button>
        </YStack>
      ) : (
        <YStack gap="4">
          <YStack
            gap="3"
            style={{
              padding: 20,
              borderRadius: 22,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <Text fontSize={22} fontWeight="800" style={{ color: colors.ink }}>
              Your travel space
            </Text>
            <Text fontSize={14} style={{ color: colors.muted }}>
              Sign in to manage your profile, saved places, and authorized venue
              workspace.
            </Text>
            <Button
              disabled={busy}
              accessibilityLabel="Continue with Google"
              onPress={() => {
                void signIn();
              }}
              style={{ backgroundColor: colors.accent, color: colors.onAccent }}
            >
              {busy ? 'Connecting…' : 'Continue with Google'}
            </Button>
          </YStack>
          <SettingsRow
            title="Private and secure"
            description="Access is linked to a verified Google account."
            symbol="◇"
          />
        </YStack>
      )}
      {error !== null ? (
        <Text accessibilityRole="alert" style={{ color: colors.error }}>
          {error}
        </Text>
      ) : null}
    </Page>
  );
}

export default function AccountScreen() {
  const colors = useTravelColors();
  if (authBaseUrl === null) {
    return (
      <Page>
        <YStack gap="2" style={{ paddingTop: 12 }}>
          <Text fontSize={30} fontWeight="800" style={{ color: colors.ink }}>
            Account
          </Text>
          <Text style={{ color: colors.muted }}>
            Connect the Wanderapp API to enable Google sign-in and secure
            account management.
          </Text>
          <Text fontSize={12} style={{ color: colors.accent }}>
            Configuration required: EXPO_PUBLIC_API_URL
          </Text>
        </YStack>
      </Page>
    );
  }
  return <AuthenticatedAccount />;
}
