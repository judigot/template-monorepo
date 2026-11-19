import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { Button, Text, YStack } from 'tamagui';
import { getAccountCallbackURL } from '../../src/auth/account-callback';
import { authBaseUrl, authClient } from '../../src/auth/auth-client';
import { Page } from '../../src/components/Page';
import { useTravelColors } from '../../src/theme';

function AuthenticatedAccount() {
  const colors = useTravelColors();
  const { data: session, isPending, refetch } = authClient.useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

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
      <YStack
        gap="4"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.line,
          borderRadius: 20,
          borderWidth: 1,
          maxWidth: 480,
          padding: 24,
          width: '100%',
        }}
      >
        {isPending ? (
          <Text style={{ color: colors.muted }}>Checking your session...</Text>
        ) : session?.user ? (
          <YStack gap="3">
            <Text
              accessibilityRole="header"
              fontSize={34}
              fontWeight="800"
              style={{ color: colors.ink }}
            >
              {session.user.name
                ? `Welcome, ${session.user.name}!`
                : 'Welcome to Wanderapp!'}
            </Text>
            <Text style={{ color: colors.muted }}>{session.user.email}</Text>
            <Button
              disabled={busy}
              onPress={() => {
                void signOut();
              }}
              style={{
                backgroundColor: colors.accentSoft,
                color: colors.accent,
              }}
            >
              {busy ? 'Logging out…' : 'Log out'}
            </Button>
          </YStack>
        ) : (
          <YStack gap="3">
            <Text
              accessibilityRole="header"
              fontSize={34}
              fontWeight="800"
              style={{ color: colors.ink }}
            >
              Travel starts here
            </Text>
            <Text style={{ color: colors.muted }}>
              Sign in securely with Google to access your account.
            </Text>
            <Button
              disabled={busy}
              onPress={() => {
                void signIn();
              }}
              style={{ backgroundColor: colors.accent, color: colors.onAccent }}
              accessibilityLabel="Continue with Google"
            >
              {busy ? 'Connecting to Google...' : 'Continue with Google'}
            </Button>
          </YStack>
        )}
        {error !== null ? (
          <Text accessibilityRole="alert" style={{ color: colors.error }}>
            {error}
          </Text>
        ) : null}
      </YStack>
    </Page>
  );
}

export default function AccountScreen() {
  const colors = useTravelColors();
  if (authBaseUrl === null) {
    return (
      <Page>
        <YStack gap="3" style={{ paddingVertical: 16 }}>
          <Text
            fontSize={12}
            fontWeight="800"
            letterSpacing={2}
            style={{ color: colors.accent }}
          >
            YOUR WANDERAPP ACCOUNT
          </Text>
          <Text fontSize={34} fontWeight="800" style={{ color: colors.ink }}>
            Account
          </Text>
          <Text style={{ color: colors.muted }}>
            Google sign-in will be available after the API URL and Google OAuth
            credentials have been configured. You can still explore destinations
            and save places locally.
          </Text>
        </YStack>
      </Page>
    );
  }

  return <AuthenticatedAccount />;
}
