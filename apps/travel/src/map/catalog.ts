import { z } from 'zod';
import { TATANGS } from './place';

const menuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  variant: z.string().nullable(),
  priceCentavos: z.number().int().nonnegative().nullable(),
  currency: z.literal('PHP'),
  serves: z.number().int().positive().nullable(),
  eligible: z.boolean(),
  available: z.boolean().optional(),
  section: z.string().optional(),
  servingBasis: z.enum(['printed', 'assumed', 'unknown']),
  sourceMonth: z.string(),
  sourceReference: z.string(),
});
export type IMenuItem = z.infer<typeof menuItemSchema>;

export const curatedPlaceSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  address: z.string(),
  locality: z.string(),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  directionsUrl: z.url(),
  iconKey: z.string(),
  category: z.string().optional(),
  coverImageUrl: z.url().nullable().optional(),
  badges: z.array(
    z.object({
      slug: z.string(),
      label: z.string(),
      edition: z.number().nullable(),
      sourceUrl: z.url().nullable(),
    }),
  ),
  menuItems: z.array(menuItemSchema),
});
export type ICuratedPlace = z.infer<typeof curatedPlaceSchema>;

const SOURCE_MONTH = '2026-08';
const SOURCE_REFERENCE =
  "Tatang's Extra Crispy Boneless Cebu Lechon menu photograph (August 2026)";
function item(
  id: string,
  name: string,
  variant: string | null,
  pesos: number | null,
  serves: number | null,
  servingBasis: IMenuItem['servingBasis'],
  eligible = serves !== null,
): IMenuItem {
  return {
    id,
    name,
    variant,
    priceCentavos: pesos === null ? null : pesos * 100,
    currency: 'PHP',
    serves,
    eligible,
    servingBasis,
    sourceMonth: SOURCE_MONTH,
    sourceReference: SOURCE_REFERENCE,
  };
}

export const TATANGS_CURATED: ICuratedPlace = {
  ...TATANGS,
  iconKey: 'lechon',
  category: 'Restaurant',
  menuItems: [
    item(
      'value-belly',
      'Value meal',
      'Lechon belly (2 puso + soft drink)',
      180,
      1,
      'assumed',
    ),
    item(
      'value-sisig',
      'Value meal',
      'Lechon sisig (2 puso + soft drink)',
      180,
      1,
      'assumed',
    ),
    item(
      'value-flakes',
      'Value meal',
      'Lechon flakes (2 puso + soft drink)',
      180,
      1,
      'assumed',
    ),
    item(
      'classic-quarter',
      'Classic lechon belly',
      '¼ kg',
      265,
      null,
      'unknown',
    ),
    item('classic-half', 'Classic lechon belly', '½ kg', 530, null, 'unknown'),
    item('classic-kilo', 'Classic lechon belly', '1 kg', 1060, null, 'unknown'),
    item('spicy-quarter', 'Spicy lechon belly', '¼ kg', 270, null, 'unknown'),
    item('spicy-half', 'Spicy lechon belly', '½ kg', 540, null, 'unknown'),
    item('spicy-kilo', 'Spicy lechon belly', '1 kg', 1080, null, 'unknown'),
    item(
      'angus-baka',
      'US Black Angus lechon baka and garlic rice',
      null,
      480,
      2,
      'printed',
    ),
    item('flakes-sharing', 'Lechon flakes', 'Good for 2', 200, 2, 'printed'),
    item('sisig-sharing', 'Sizzling sisig', 'Good for 2', 200, 2, 'printed'),
    item('dinuguan', 'Crispy dinuguan', null, 60, null, 'unknown'),
    item('bicol', 'Bicol Express', null, 60, null, 'unknown'),
    item(
      'scallops',
      'Scallops with garlic and cheese',
      null,
      220,
      null,
      'unknown',
    ),
    item('puso', 'Puso (hanging rice)', 'Extra', 10, null, 'unknown', false),
    item('soft-drink', 'Soft drink', 'Extra', 25, null, 'unknown', false),
    item('water', 'Water', 'Extra', 25, null, 'unknown', false),
    item(
      'half-belly',
      'Half belly',
      'Approx. 2–2.5 kg',
      null,
      null,
      'unknown',
      false,
    ),
    item(
      'whole-belly',
      'Whole belly',
      'Approx. 4–5 kg',
      null,
      null,
      'unknown',
      false,
    ),
  ],
};
export const OFFLINE_CURATED_PLACES: readonly ICuratedPlace[] = [
  TATANGS_CURATED,
];

export function affordableItems(
  place: ICuratedPlace,
  budgetCentavos: number,
  people: number,
): { item: IMenuItem; groupTotal: number | null; quantity: number | null }[] {
  return place.menuItems.flatMap((item) => {
    if (item.available === false || item.priceCentavos === null || item.priceCentavos <= 0) {
      return [];
    }
    const quantity = item.serves === null ? null : Math.ceil(people / item.serves);
    const groupTotal = quantity === null ? null : quantity * item.priceCentavos;
    if (groupTotal !== null ? groupTotal > budgetCentavos : item.priceCentavos > budgetCentavos) {
      return [];
    }
    return [{ item, quantity, groupTotal }];
  }).sort((a, b) => (a.groupTotal ?? a.item.priceCentavos ?? 0) -
    (b.groupTotal ?? b.item.priceCentavos ?? 0) || a.item.name.localeCompare(b.item.name));
}

const catalogSchema = z.object({ places: z.array(curatedPlaceSchema) });

export async function fetchCuratedPlaces(
  baseUrl: string,
  signal: AbortSignal,
): Promise<ICuratedPlace[]> {
  const response = await fetch(`${baseUrl}/api/places`, { signal });
  if (!response.ok) {
    throw new Error(`Catalog request failed (${String(response.status)})`);
  }
  const payload: unknown = await response.json();
  return catalogSchema.parse(payload).places;
}

export interface IViewport {
  west: number;
  south: number;
  east: number;
  north: number;
}

export const CEBU_VIEWPORT: IViewport = {
  west: 123.88,
  south: 10.315,
  east: 123.92,
  north: 10.35,
};

export function inViewport(place: ICuratedPlace, bounds: IViewport): boolean {
  if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) {
    return false;
  }
  const longitudeInView =
    bounds.west <= bounds.east
      ? place.longitude >= bounds.west && place.longitude <= bounds.east
      : place.longitude >= bounds.west || place.longitude <= bounds.east;
  return (
    longitudeInView &&
    place.latitude >= bounds.south &&
    place.latitude <= bounds.north
  );
}
