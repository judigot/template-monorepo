import { Input, Text, YStack } from 'tamagui';
import { useTravelColors } from '../theme';
import type { IManagedPlace, IPlaceEdit } from './api';

export interface IPlaceDraft {
  slug: string;
  name: string;
  description: string;
  category: string;
  address: string;
  locality: string;
  longitude: string;
  latitude: string;
  directionsUrl: string;
  coverImageUrl: string;
  iconKey: string;
}

export function draftFromPlace(place: IManagedPlace): IPlaceDraft {
  return {
    slug: place.slug,
    name: place.name,
    description: place.description,
    category: place.category ?? 'Restaurant',
    address: place.address,
    locality: place.locality,
    longitude: String(place.longitude),
    latitude: String(place.latitude),
    directionsUrl: place.directionsUrl,
    coverImageUrl: place.coverImageUrl ?? '',
    iconKey: place.iconKey,
  };
}

export const NEW_PLACE: IPlaceDraft = {
  slug: '',
  name: '',
  description: '',
  category: 'Restaurant',
  address: '',
  locality: 'Cebu City',
  longitude: '',
  latitude: '',
  directionsUrl: '',
  coverImageUrl: '',
  iconKey: 'restaurant',
};

export function placeInput(draft: IPlaceDraft): IPlaceEdit {
  if (
    !Number.isFinite(Number(draft.longitude)) ||
    !Number.isFinite(Number(draft.latitude)) ||
    draft.longitude.trim().length === 0 ||
    draft.latitude.trim().length === 0
  ) {
    throw new Error('Enter valid latitude and longitude.');
  }
  if (
    draft.name.trim().length < 2 ||
    draft.description.trim().length === 0 ||
    draft.address.trim().length < 2 ||
    draft.locality.trim().length < 2
  ) {
    throw new Error('Complete the venue name, description, and address.');
  }
  if (!draft.directionsUrl.startsWith('https://')) {
    throw new Error('Directions must use a secure HTTPS URL.');
  }
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    category: draft.category.trim(),
    address: draft.address.trim(),
    locality: draft.locality.trim(),
    longitude: Number(draft.longitude),
    latitude: Number(draft.latitude),
    directionsUrl: draft.directionsUrl.trim(),
    coverImageUrl:
      draft.coverImageUrl.trim().length === 0
        ? null
        : draft.coverImageUrl.trim(),
    iconKey: draft.iconKey.trim(),
  };
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'numeric' | 'default';
}) {
  const colors = useTravelColors();
  return (
    <YStack gap="2">
      <Text fontWeight="700" fontSize={12} style={{ color: colors.muted }}>
        {label}
      </Text>
      <Input
        size="md"
        value={value}
        placeholder={placeholder}
        keyboardType={keyboardType}
        accessibilityLabel={label}
        onChangeText={onChange}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.line,
          color: colors.ink,
        }}
      />
    </YStack>
  );
}

export function PlaceFields({
  draft,
  onChange,
  includeSlug = false,
}: {
  draft: IPlaceDraft;
  onChange: (draft: IPlaceDraft) => void;
  includeSlug?: boolean;
}) {
  const update = (name: keyof IPlaceDraft, value: string) => {
    onChange({ ...draft, [name]: value });
  };
  return (
    <YStack gap="3">
      {includeSlug ? (
        <Field
          label="URL slug (lowercase, hyphens)"
          value={draft.slug}
          onChange={(value) => {
            update('slug', value);
          }}
          placeholder="venue-name"
        />
      ) : null}
      <Field label="Venue name" value={draft.name} onChange={(value) => { update('name', value); }} />
      <Field label="Description" value={draft.description} onChange={(value) => { update('description', value); }} />
      <Field label="Category" value={draft.category} onChange={(value) => { update('category', value); }} />
      <Field label="Street address" value={draft.address} onChange={(value) => { update('address', value); }} />
      <Field label="Locality" value={draft.locality} onChange={(value) => { update('locality', value); }} />
      <Field label="Latitude" value={draft.latitude} keyboardType="numeric" onChange={(value) => { update('latitude', value); }} />
      <Field label="Longitude" value={draft.longitude} keyboardType="numeric" onChange={(value) => { update('longitude', value); }} />
      <Field label="Google Maps directions URL" value={draft.directionsUrl}
        onChange={(value) => { update('directionsUrl', value); }} />
      <Field label="Cover image HTTPS URL (optional)" value={draft.coverImageUrl}
        onChange={(value) => { update('coverImageUrl', value); }} />
      <Field label="Map icon key" value={draft.iconKey} onChange={(value) => { update('iconKey', value); }} />
    </YStack>
  );
}
