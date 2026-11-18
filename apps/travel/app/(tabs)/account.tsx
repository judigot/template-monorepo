import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { Button, Text, YStack } from 'tamagui';
import { authBaseUrl, authClient } from '../../src/auth/auth-client';
import { Page } from '../../src/components/Page';
import { COLORS } from '../../src/theme';

function AuthenticatedAccount() {
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
        callbackURL: '/account',
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
      <YStack gap="4" style={{ paddingVertical: 16 }}>
        <Text
          fontSize={12}
          fontWeight="800"
          letterSpacing={2}
          style={{ color: COLORS.accent }}
        >
          YOUR ROAM ACCOUNT
        </Text>
        <Text fontSize={34} fontWeight="800" style={{ color: COLORS.ink }}>
          {session?.user ? 'Welcome back' : 'Travel starts here'}
        </Text>
        {isPending ? (
          <Text style={{ color: COLORS.muted }}>Checking your session...</Text>
        ) : session?.user ? (
          <YStack gap="3">
            <Text fontSize={20} fontWeight="700" style={{ color: COLORS.ink }}>
              {session.user.name}
            </Text>
            <Text style={{ color: COLORS.muted }}>{session.user.email}</Text>
            <Button
              disabled={busy}
              onPress={() => {
                void signOut();
              }}
              style={{
                backgroundColor: COLORS.accentSoft,
                color: COLORS.accent,
              }}
              accessibilityLabel="Sign out"
            >
              {busy ? 'Signing out...' : 'Sign out'}
            </Button>
          </YStack>
        ) : (
          <YStack gap="3">
            <Text style={{ color: COLORS.muted }}>
              Sign in securely with Google to access your account.
            </Text>
            <Button
              disabled={busy}
              onPress={() => {
                void signIn();
              }}
              style={{ backgroundColor: COLORS.accent, color: COLORS.surface }}
              accessibilityLabel="Continue with Google"
            >
              {busy ? 'Connecting to Google...' : 'Continue with Google'}
            </Button>
          </YStack>
        )}
        {error !== null ? (
          <Text accessibilityRole="alert" style={{ color: '#b42318' }}>
            {error}
          </Text>
        ) : null}
      </YStack>
    </Page>
  );
}

export default function AccountScreen() {
  if (authBaseUrl === null) {
    return (
      <Page>
        <YStack gap="3" style={{ paddingVertical: 16 }}>
          <Text
            fontSize={12}
            fontWeight="800"
            letterSpacing={2}
            style={{ color: COLORS.accent }}
          >
            YOUR ROAM ACCOUNT
          </Text>
          <Text fontSize={34} fontWeight="800" style={{ color: COLORS.ink }}>
            Account
          </Text>
          <Text style={{ color: COLORS.muted }}>
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
