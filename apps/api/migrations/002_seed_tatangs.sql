BEGIN;

INSERT INTO wanderapp.places (
    slug, name, description, address, locality, country_code, location, directions_url, published_at
) VALUES (
    'tatangs-lechon',
    'Tatang''s Extra Crispy Boneless Lechon',
    'A Cebu lechon spot known for its crispy-skinned, boneless roast pork.',
    '8WJ2+Q43, Wilson St, Apas, Cebu City, 6000 Cebu',
    'Cebu City',
    'PH',
    public.ST_SetSRID(public.ST_MakePoint(123.900296875, 10.3318875), 4326)::public.geography,
    'https://www.google.com/maps/search/?api=1&query=Tatang%27s%20Extra%20Crispy%20Boneless%20Lechon%2C%20Cebu%20City&query_place_id=ChIJHYgmjSaZqTMRprjnw80UUkw',
    now()
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO wanderapp.badges (scope, slug, label)
VALUES ('place', 'michelin-bib-gourmand', 'Michelin Bib Gourmand')
ON CONFLICT (scope, slug) DO NOTHING;

INSERT INTO wanderapp.place_badges (place_id, badge_id, edition, source_url)
SELECT places.id, badges.id, 2027,
    'https://guide.michelin.com/ph/en/article/michelin-guide-ceremony/full-list-michelin-guide-ph-2027'
FROM wanderapp.places AS places
CROSS JOIN wanderapp.badges AS badges
WHERE places.slug = 'tatangs-lechon'
  AND badges.scope = 'place'
  AND badges.slug = 'michelin-bib-gourmand'
ON CONFLICT (place_id, badge_id) DO NOTHING;

COMMIT;
