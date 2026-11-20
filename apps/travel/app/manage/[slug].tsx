import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, ScrollView, Switch, View } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import {
  addOwner,
  getAccountAccess,
  getManagedPlaces,
  type IAccountAccess,
  type IManagedPlace,
  type IMenuEdit,
  listOwners,
  removeOwner,
  saveMenuItem,
  savePlace,
} from '../../src/admin/api';
import {
  draftFromPlace,
  type IPlaceDraft,
  PlaceFields,
  placeInput,
} from '../../src/admin/PlaceFields';
import { Page } from '../../src/components/Page';
import { pesos } from '../../src/map/estimate';
import { useTravelColors } from '../../src/theme';

interface IItemDraft {
  id: string;
  name: string;
  variant: string;
  section: string;
  price: string;
  serves: string;
  eligible: boolean;
  available: boolean;
  servingBasis: 'printed' | 'assumed' | 'unknown';
}

const NEW_ITEM: IItemDraft = {
  id: '',
  name: '',
  variant: '',
  section: 'Menu',
  price: '',
  serves: '',
  eligible: false,
  available: true,
  servingBasis: 'unknown',
};

function toDraft(item: IManagedPlace['menuItems'][number]): IItemDraft {
  return {
    id: item.id,
    name: item.name,
    variant: item.variant ?? '',
    section: item.section ?? 'Menu',
    price: item.priceCentavos === null ? '' : String(item.priceCentavos / 100),
    serves: item.serves === null ? '' : String(item.serves),
    eligible: item.eligible,
    available: item.available !== false,
    servingBasis: item.servingBasis,
  };
}

function validItem(draft: IItemDraft): IMenuEdit {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.id)) {
    throw new Error(
      'The item ID must use lowercase letters, numbers, and hyphens.',
    );
  }
  if (draft.name.trim().length === 0) {
    throw new Error('Enter a menu item name.');
  }
  if (draft.price.length > 0 && !/^\d{1,7}(?:\.\d{1,2})?$/.test(draft.price)) {
    throw new Error('Enter a peso price with at most two decimal places.');
  }
  const priceCentavos =
    draft.price.length === 0 ? null : Math.round(Number(draft.price) * 100);
  const serves = draft.serves.length === 0 ? null : Number(draft.serves);
  if (
    priceCentavos !== null &&
    (priceCentavos <= 0 || priceCentavos > 100000000)
  ) {
    throw new Error('Price must be between ₱0.01 and ₱1,000,000.');
  }
  if (
    serves !== null &&
    (!Number.isInteger(serves) || serves < 1 || serves > 100)
  ) {
    throw new Error('Serving count must be between 1 and 100.');
  }
  if (
    draft.eligible &&
    (serves === null ||
      priceCentavos === null ||
      draft.servingBasis === 'unknown')
  ) {
    throw new Error(
      'An eligible group meal needs a price and a documented or assumed serving count.',
    );
  }
  return {
    name: draft.name.trim(),
    variant: draft.variant.trim().length > 0 ? draft.variant.trim() : null,
    section: draft.section.trim(),
    priceCentavos,
    serves,
    available: draft.available,
    eligible: draft.eligible,
    servingBasis: draft.servingBasis,
  };
}

function ItemEditor({
  draft,
  onChange,
  onCancel,
  onSave,
  busy,
  error,
}: {
  draft: IItemDraft;
  onChange: (value: IItemDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  busy: boolean;
  error: string | null;
}) {
  const colors = useTravelColors();
  const change = (field: keyof IItemDraft, value: string | boolean) => {
    onChange({ ...draft, [field]: value });
  };
  return (
    <Modal visible animationType="slide" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: colors.canvas }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingTop: 56, gap: 16 }}
        >
          <Text fontSize={25} fontWeight="800" style={{ color: colors.ink }}>
            Menu item
          </Text>
          <Text fontSize={12} style={{ color: colors.muted }}>
            Save to publish this menu change across Wanderapp.
          </Text>
          {(
            [
              ['id', 'Stable item ID', 'lowercase-with-hyphens'],
              ['name', 'Item name', 'Lechon belly'],
              ['variant', 'Variant or size', 'Optional'],
              ['section', 'Menu section', 'Mains, Value meals, Drinks'],
              ['price', 'Price in PHP', '180.00'],
              ['serves', 'People served', 'Leave blank if unknown'],
            ] as const
          ).map(([key, label, placeholder]) => (
            <YStack key={key} gap="2">
              <Text
                fontWeight="700"
                fontSize={12}
                style={{ color: colors.muted }}
              >
                {label}
              </Text>
              <Input
                value={draft[key]}
                accessibilityLabel={label}
                placeholder={placeholder}
                keyboardType={
                  key === 'price' || key === 'serves'
                    ? 'decimal-pad'
                    : 'default'
                }
                onChangeText={(value) => {
                  change(key, value);
                }}
                style={{ backgroundColor: colors.surface, color: colors.ink }}
              />
            </YStack>
          ))}
          <Text fontWeight="700" style={{ color: colors.ink }}>
            Serving count basis
          </Text>
          <XStack gap="2">
            {(['printed', 'assumed', 'unknown'] as const).map((basis) => (
              <Button
                key={basis}
                size="sm"
                onPress={() => {
                  change('servingBasis', basis);
                }}
                style={{
                  backgroundColor:
                    draft.servingBasis === basis
                      ? colors.accentSoft
                      : colors.surface,
                  color:
                    draft.servingBasis === basis ? colors.accent : colors.ink,
                }}
              >
                {basis}
              </Button>
            ))}
          </XStack>
          <XStack items="center" justify="space-between">
            <YStack flex={1} gap="1">
              <Text fontWeight="700" style={{ color: colors.ink }}>
                Counts toward group budget
              </Text>
              <Text fontSize={11} style={{ color: colors.muted }}>
                Only select if price and servings are known.
              </Text>
            </YStack>
            <Switch
              value={draft.eligible}
              onValueChange={(value) => {
                change('eligible', value);
              }}
              accessibilityLabel="Item qualifies for group budget"
            />
          </XStack>
          <XStack items="center" justify="space-between">
            <Text fontWeight="700" style={{ color: colors.ink }}>
              Available on menu
            </Text>
            <Switch
              value={draft.available}
              onValueChange={(value) => {
                change('available', value);
              }}
              accessibilityLabel="Available on menu"
            />
          </XStack>
          {error !== null ? (
            <Text accessibilityRole="alert" style={{ color: colors.error }}>
              {error}
            </Text>
          ) : null}
          <Button
            disabled={busy}
            onPress={onSave}
            style={{ backgroundColor: colors.accent, color: colors.onAccent }}
          >
            {busy ? 'Saving…' : 'Publish menu item'}
          </Button>
          <Button onPress={onCancel}>Cancel</Button>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ManageVenueScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const colors = useTravelColors();
  const [place, setPlace] = useState<IManagedPlace | null>(null);
  const [access, setAccess] = useState<IAccountAccess | null>(null);
  const [draft, setDraft] = useState<IPlaceDraft | null>(null);
  const [itemDraft, setItemDraft] = useState<IItemDraft | null>(null);
  const [editingPlace, setEditingPlace] = useState(false);
  const [owners, setOwners] = useState<string[]>([]);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemError, setItemError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (typeof slug !== 'string') {
      return;
    }
    void (async () => {
      try {
        const profile = await getAccountAccess();
        const venue = (await getManagedPlaces()).find(
          (item) => item.slug === slug,
        );
        if (venue === undefined) {
          throw new Error('You do not have permission to manage this venue.');
        }
        setAccess(profile);
        setPlace(venue);
        setDraft(draftFromPlace(venue));
        setOwners(profile.role === 'admin' ? await listOwners(slug) : []);
        setError(null);
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : 'Could not load venue.',
        );
      }
    })();
  }, [slug]);
  useFocusEffect(refresh);

  const updateVenue = async () => {
    if (draft === null || typeof slug !== 'string') {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await savePlace(slug, placeInput(draft));
      setEditingPlace(false);
      setNotice('Venue details published.');
      refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not save place.',
      );
    } finally {
      setBusy(false);
    }
  };

  const updateItem = async () => {
    if (itemDraft === null || typeof slug !== 'string') {
      return;
    }
    setBusy(true);
    setItemError(null);
    try {
      await saveMenuItem(slug, itemDraft.id, validItem(itemDraft));
      setItemDraft(null);
      setNotice('Menu updated and published.');
      refresh();
    } catch (cause) {
      setItemError(
        cause instanceof Error ? cause.message : 'Could not save menu item.',
      );
    } finally {
      setBusy(false);
    }
  };

  const inviteOwner = async () => {
    if (typeof slug !== 'string') {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await addOwner(slug, ownerEmail.trim());
      setOwnerEmail('');
      setNotice('Venue ownership granted to this verified email.');
      refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not assign venue owner.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <YStack gap="1" style={{ paddingTop: 8 }}>
        <Text
          fontSize={11}
          fontWeight="800"
          letterSpacing={1.4}
          style={{ color: colors.accent }}
        >
          VENUE WORKSPACE
        </Text>
        <Text fontSize={27} fontWeight="800" style={{ color: colors.ink }}>
          {place?.name ?? 'Manage venue'}
        </Text>
        <Text fontSize={13} style={{ color: colors.muted }}>
          Edit property details and publish accurate menu prices.
        </Text>
      </YStack>
      {error !== null ? (
        <Text accessibilityRole="alert" style={{ color: colors.error }}>
          {error}
        </Text>
      ) : null}
      {notice !== null ? (
        <Text style={{ color: colors.accent }}>{notice}</Text>
      ) : null}
      {draft !== null && place !== null ? (
        <YStack
          gap="3"
          style={{
            padding: 16,
            backgroundColor: colors.surface,
            borderColor: colors.line,
            borderWidth: 1,
            borderRadius: 20,
          }}
        >
          <XStack justify="space-between" items="center">
            <Text fontSize={18} fontWeight="800" style={{ color: colors.ink }}>
              Venue details
            </Text>
            <Button
              size="sm"
              onPress={() => {
                setEditingPlace((current) => !current);
              }}
            >
              {editingPlace ? 'Collapse' : 'Edit'}
            </Button>
          </XStack>
          <Text fontSize={12} style={{ color: colors.muted }}>
            {place.address}
          </Text>
          {editingPlace ? (
            <YStack gap="3">
              <PlaceFields draft={draft} onChange={setDraft} />
              <Button
                disabled={busy}
                onPress={() => {
                  void updateVenue();
                }}
                style={{
                  backgroundColor: colors.accent,
                  color: colors.onAccent,
                }}
              >
                {busy ? 'Saving…' : 'Save venue'}
              </Button>
            </YStack>
          ) : null}
        </YStack>
      ) : null}
      <YStack gap="3">
        <XStack justify="space-between" items="center">
          <Text fontSize={18} fontWeight="800" style={{ color: colors.ink }}>
            Menu and prices
          </Text>
          <Button
            size="sm"
            onPress={() => {
              setItemError(null);
              setItemDraft({ ...NEW_ITEM });
            }}
            style={{ backgroundColor: colors.accentSoft, color: colors.accent }}
          >
            + Add item
          </Button>
        </XStack>
        {place?.menuItems.map((item) => (
          <View
            key={item.id}
            style={{
              padding: 14,
              borderWidth: 1,
              borderColor: colors.line,
              borderRadius: 16,
              backgroundColor: colors.surface,
            }}
          >
            <XStack items="center" justify="space-between" gap="3">
              <YStack flex={1} gap="1">
                <Text
                  fontSize={14}
                  fontWeight="800"
                  style={{ color: colors.ink }}
                >
                  {item.name}
                  {item.variant === null ? '' : ` · ${item.variant}`}
                </Text>
                <Text fontSize={11} style={{ color: colors.muted }}>
                  {item.section ?? 'Menu'} ·{' '}
                  {item.available === false
                    ? 'Hidden from catalog'
                    : 'Published'}
                </Text>
              </YStack>
              <Text
                fontSize={14}
                fontWeight="800"
                style={{ color: colors.accent }}
              >
                {item.priceCentavos === null
                  ? 'Ask venue'
                  : pesos(item.priceCentavos)}
              </Text>
              <Button
                size="sm"
                onPress={() => {
                  setItemError(null);
                  setItemDraft(toDraft(item));
                }}
              >
                Edit
              </Button>
            </XStack>
          </View>
        ))}
      </YStack>
      {access?.role === 'admin' && typeof slug === 'string' ? (
        <YStack
          gap="3"
          style={{
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 16,
          }}
        >
          <Text fontSize={18} fontWeight="800" style={{ color: colors.ink }}>
            Restaurant owners
          </Text>
          <Text fontSize={12} style={{ color: colors.muted }}>
            Each assigned owner can edit only this venue and its menu. Invitees
            must sign in with their verified Google email.
          </Text>
          {owners.map((owner) => (
            <XStack key={owner} justify="space-between" items="center">
              <Text flex={1} fontSize={13} style={{ color: colors.ink }}>
                {owner}
              </Text>
              <Button
                size="sm"
                onPress={() => {
                  void (async () => {
                    try {
                      await removeOwner(slug, owner);
                      refresh();
                    } catch (cause) {
                      setError(
                        cause instanceof Error
                          ? cause.message
                          : 'Could not revoke owner.',
                      );
                    }
                  })();
                }}
              >
                Revoke
              </Button>
            </XStack>
          ))}
          <Input
            value={ownerEmail}
            onChangeText={setOwnerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="owner@example.com"
            accessibilityLabel="New venue owner email"
          />
          <Button
            disabled={busy || ownerEmail.trim().length === 0}
            onPress={() => {
              void inviteOwner();
            }}
            style={{ backgroundColor: colors.accentSoft, color: colors.accent }}
          >
            Add restaurant owner
          </Button>
        </YStack>
      ) : null}
      <Button
        onPress={() => {
          router.back();
        }}
      >
        Back to workspace
      </Button>
      {itemDraft !== null ? (
        <ItemEditor
          draft={itemDraft}
          onChange={setItemDraft}
          onCancel={() => {
            setItemDraft(null);
          }}
          onSave={() => {
            void updateItem();
          }}
          busy={busy}
          error={itemError}
        />
      ) : null}
    </Page>
  );
}
