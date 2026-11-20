import { Platform } from 'react-native';
import { z } from 'zod';
import { authBaseUrl, authClient } from '../auth/auth-client';
import { curatedPlaceSchema } from '../map/catalog';

const managedPlaceSchema = curatedPlaceSchema.omit({ badges: true });
const meSchema = z.object({
  email: z.email(),
  role: z.enum(['admin', 'owner', 'member']),
  managedPlaces: z.array(z.object({ slug: z.string(), name: z.string() })),
});
const placeListSchema = z.object({ places: z.array(managedPlaceSchema) });
const emailListSchema = z.object({ admins: z.array(z.object({ email: z.email() })) });
const ownerListSchema = z.object({ owners: z.array(z.object({ email: z.email() })) });

export type IManagedPlace = z.infer<typeof managedPlaceSchema>;
export type IAccountAccess = z.infer<typeof meSchema>;
export type IMenuEdit = {
  name: string;
  variant: string | null;
  section: string;
  priceCentavos: number | null;
  serves: number | null;
  eligible: boolean;
  available: boolean;
  servingBasis: 'printed' | 'assumed' | 'unknown';
};
export type IPlaceEdit = {
  name: string;
  description: string;
  category: string;
  address: string;
  locality: string;
  longitude: number;
  latitude: number;
  directionsUrl: string;
  coverImageUrl: string | null;
  iconKey: string;
};

async function authenticatedFetch(path: string, init: RequestInit = {}): Promise<unknown> {
  if (authBaseUrl === null) {
    throw new Error('Connect an API origin before managing places.');
  }
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body !== undefined && init.body !== null) {
    headers.set('Content-Type', 'application/json');
  }
  if (Platform.OS !== 'web') {
    const cookie = await authClient.getCookie();
    if (typeof cookie === 'string' && cookie.length > 0) {
      headers.set('Cookie', cookie);
    }
  }
  const response = await fetch(`${authBaseUrl}/api/manage${path}`, {
    ...init,
    headers,
    credentials: Platform.OS === 'web' ? 'include' : 'omit',
  });
  const payload: unknown = await response.json();
  if (!response.ok) {
    const error = z.object({ error: z.string() }).safeParse(payload);
    throw new Error(error.success ? error.data.error : `Request failed (${String(response.status)})`);
  }
  return payload;
}

export async function getAccountAccess(): Promise<IAccountAccess> {
  return meSchema.parse(await authenticatedFetch('/me'));
}

export async function getManagedPlaces(): Promise<IManagedPlace[]> {
  return placeListSchema.parse(await authenticatedFetch('/places')).places;
}

export async function savePlace(slug: string, input: IPlaceEdit): Promise<void> {
  await authenticatedFetch(`/places/${encodeURIComponent(slug)}`, {
    method: 'PATCH', body: JSON.stringify(input),
  });
}

export async function createPlace(slug: string, input: IPlaceEdit): Promise<void> {
  await authenticatedFetch('/places', {
    method: 'POST', body: JSON.stringify({ slug, ...input }),
  });
}

export async function saveMenuItem(slug: string, itemId: string, input: IMenuEdit): Promise<void> {
  await authenticatedFetch(`/places/${encodeURIComponent(slug)}/items/${encodeURIComponent(itemId)}`, {
    method: 'PUT', body: JSON.stringify(input),
  });
}

export async function listAdmins(): Promise<string[]> {
  return emailListSchema.parse(await authenticatedFetch('/admins')).admins.map((a) => a.email);
}

export async function addAdmin(email: string): Promise<void> {
  await authenticatedFetch('/admins', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function removeAdmin(email: string): Promise<void> {
  await authenticatedFetch(`/admins/${encodeURIComponent(email)}`, { method: 'DELETE' });
}

export async function listOwners(slug: string): Promise<string[]> {
  return ownerListSchema.parse(await authenticatedFetch(`/places/${encodeURIComponent(slug)}/owners`))
    .owners.map((owner) => owner.email);
}

export async function addOwner(slug: string, email: string): Promise<void> {
  await authenticatedFetch(`/places/${encodeURIComponent(slug)}/owners`, {
    method: 'POST', body: JSON.stringify({ email }),
  });
}

export async function removeOwner(slug: string, email: string): Promise<void> {
  await authenticatedFetch(`/places/${encodeURIComponent(slug)}/owners/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
}
