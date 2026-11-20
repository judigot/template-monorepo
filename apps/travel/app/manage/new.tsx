import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Text, YStack } from 'tamagui';
import { createPlace } from '../../src/admin/api';
import { NEW_PLACE, PlaceFields, placeInput, type IPlaceDraft } from '../../src/admin/PlaceFields';
import { Page } from '../../src/components/Page';
import { useTravelColors } from '../../src/theme';

export default function NewVenueScreen() {
  const router = useRouter();
  const colors = useTravelColors();
  const [draft, setDraft] = useState<IPlaceDraft>(NEW_PLACE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const slug = draft.slug.trim();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error('Use a lowercase slug with hyphens.');
      }
      await createPlace(slug, placeInput(draft));
      router.replace({ pathname: '/manage/[slug]', params: { slug } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create venue.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <YStack gap="1" style={{ paddingTop: 10 }}>
        <Text fontSize={11} fontWeight="800" letterSpacing={1.6} style={{ color: colors.accent }}>
          NEW VENUE
        </Text>
        <Text fontSize={28} fontWeight="800" style={{ color: colors.ink }}>Create a place</Text>
        <Text fontSize={13} style={{ color: colors.muted }}>
          Create a published location, then add menu items and assign an owner.
        </Text>
      </YStack>
      <YStack gap="3" style={{
        borderRadius: 20, borderColor: colors.line, borderWidth: 1,
        backgroundColor: colors.surface, padding: 16,
      }}>
        <PlaceFields draft={draft} onChange={setDraft} includeSlug />
      </YStack>
      {error !== null ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text> : null}
      <Button disabled={busy} onPress={() => { void save(); }}
        style={{ backgroundColor: colors.accent, color: colors.onAccent }}>
        {busy ? 'Creating…' : 'Create place'}
      </Button>
      <Button onPress={() => { router.back(); }}>Cancel</Button>
    </Page>
  );
}
