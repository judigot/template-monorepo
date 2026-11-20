export type Region = 'all' | 'asia' | 'europe';
export type DestinationRegion = Exclude<Region, 'all'>;

export interface IDestination {
  id: string;
  name: string;
  country: string;
  region: DestinationRegion;
  tagline: string;
  description: string;
  bestFor: string;
  duration: string;
  imageUrl: string;
  highlights: readonly string[];
}

export const DESTINATIONS: readonly IDestination[] = [
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    region: 'asia',
    tagline: 'Tradition, temples, and quiet streets',
    description:
      'Wander through historic lanes, visit peaceful gardens, and discover the flavors of Japan at your own pace.',
    bestFor: 'Culture and food',
    duration: '4 to 6 days',
    imageUrl:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&q=80',
    highlights: [
      'Sunrise walk at Fushimi Inari',
      'Tea and markets in Gion',
      'Bamboo groves in Arashiyama',
    ],
  },
  {
    id: 'siargao',
    name: 'Siargao',
    country: 'Philippines',
    region: 'asia',
    tagline: 'Island rhythms and ocean days',
    description:
      'Spend your days island hopping, surfing, and finding small cafés along laid-back tropical roads.',
    bestFor: 'Beaches and adventure',
    duration: '5 to 7 days',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80',
    highlights: [
      'Spend a morning on the water',
      'Explore palm-lined island roads',
      'Catch a sunset by the coast',
    ],
  },
  {
    id: 'amalfi',
    name: 'Amalfi Coast',
    country: 'Italy',
    region: 'europe',
    tagline: 'Colorful towns above the sea',
    description:
      'A slow coastal escape filled with seaside villages, lemon groves, and unforgettable Mediterranean views.',
    bestFor: 'Coastal escapes',
    duration: '4 to 6 days',
    imageUrl:
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&q=80',
    highlights: [
      'Explore the streets of Positano',
      'Enjoy a relaxed seaside lunch',
      'Take in views along the coastal road',
    ],
  },
  {
    id: 'swiss-alps',
    name: 'Swiss Alps',
    country: 'Switzerland',
    region: 'europe',
    tagline: 'Mountain trails and alpine air',
    description:
      'Ride scenic trains, walk beside turquoise lakes, and discover villages surrounded by immense peaks.',
    bestFor: 'Nature and hiking',
    duration: '5 to 8 days',
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1000&q=80',
    highlights: [
      'Ride a panoramic mountain train',
      'Hike toward an alpine viewpoint',
      'Spend an afternoon beside a lake',
    ],
  },
];

export function filterDestinations(
  destinations: readonly IDestination[],
  query: string,
  region: Region,
): IDestination[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return destinations.filter((destination) => {
    const matchesRegion = region === 'all' || destination.region === region;
    const searchText = [
      destination.name,
      destination.country,
      destination.tagline,
      destination.description,
      destination.bestFor,
    ]
      .join(' ')
      .toLocaleLowerCase();

    return matchesRegion && searchText.includes(normalizedQuery);
  });
}

export function getDestination(id: string): IDestination | undefined {
  return DESTINATIONS.find((destination) => destination.id === id);
}
