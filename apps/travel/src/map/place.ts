import { z } from 'zod';
import type { ICuratedPlace, IViewport } from './catalog';

const httpsUrl = z.url().refine((value) => value.startsWith('https://'));

const placeSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  address: z.string(),
  locality: z.string(),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  directionsUrl: httpsUrl,
  badges: z.array(
    z.object({
      slug: z.string(),
      label: z.string(),
      edition: z.number().int().nullable(),
      sourceUrl: httpsUrl.nullable(),
    }),
  ),
});

export type IPlace = z.infer<typeof placeSchema>;

// Keep the first curated place available in an unconfigured or offline demo.
export const TATANGS: IPlace = {
  slug: 'tatangs-lechon',
  name: "Tatang's Extra Crispy Boneless Lechon",
  description:
    'A Cebu lechon spot known for its crispy-skinned, boneless roast pork.',
  address: '8WJ2+Q43, Wilson St, Apas, Cebu City, 6000 Cebu',
  locality: 'Cebu City',
  longitude: 123.900296875,
  latitude: 10.3318875,
  directionsUrl:
    'https://www.google.com/maps/search/?api=1&query=Tatang%27s%20Extra%20Crispy%20Boneless%20Lechon%2C%20Cebu%20City&query_place_id=ChIJHYgmjSaZqTMRprjnw80UUkw',
  badges: [
    {
      slug: 'michelin-bib-gourmand',
      label: 'Michelin Bib Gourmand',
      edition: 2027,
      sourceUrl:
        'https://guide.michelin.com/ph/en/article/michelin-guide-ceremony/full-list-michelin-guide-ph-2027',
    },
  ],
};

export async function fetchFeaturedPlace(baseUrl: string, signal: AbortSignal) {
  const response = await fetch(`${baseUrl}/api/places/${TATANGS.slug}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`Place request failed (${String(response.status)})`);
  }
  const payload: unknown = await response.json();
  return placeSchema.parse(payload);
}

export const MAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const;
export const MAP_ZOOM = 15.5;
export const PLACE_LABEL_MIN_ZOOM = 15;

export interface IExploreCamera {
  center: [number, number];
  zoom: number;
  bounds: IViewport;
}
export interface IExploreMapProps {
  places: readonly ICuratedPlace[];
  camera: IExploreCamera;
  onOpen: (place: ICuratedPlace) => void;
  onViewChange: (camera: IExploreCamera) => void;
  onError: () => void;
  dark: boolean;
  focus: { longitude: number; latitude: number; request: number } | null;
}
