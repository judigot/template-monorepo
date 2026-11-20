BEGIN;

CREATE TABLE IF NOT EXISTS wanderapp.menu_items (
    place_id uuid NOT NULL REFERENCES wanderapp.places(id) ON DELETE CASCADE,
    item_id text NOT NULL CHECK (item_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    name text NOT NULL CHECK (btrim(name) <> ''),
    variant text,
    price_centavos integer CHECK (price_centavos > 0),
    currency char(3) NOT NULL DEFAULT 'PHP' CHECK (currency = 'PHP'),
    serves smallint CHECK (serves > 0),
    eligible boolean NOT NULL DEFAULT false,
    serving_basis text NOT NULL CHECK (serving_basis IN ('printed', 'assumed', 'unknown')),
    source_month char(7) NOT NULL,
    source_reference text NOT NULL,
    PRIMARY KEY (place_id, item_id),
    CHECK (NOT eligible OR (price_centavos IS NOT NULL AND serves IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS wanderapp.featured_places (
    place_id uuid PRIMARY KEY REFERENCES wanderapp.places(id) ON DELETE CASCADE,
    icon_key text NOT NULL CHECK (icon_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

INSERT INTO wanderapp.featured_places (place_id, icon_key)
SELECT id, 'lechon' FROM wanderapp.places WHERE slug = 'tatangs-lechon'
ON CONFLICT (place_id) DO UPDATE SET icon_key = excluded.icon_key;

WITH seed (item_id, name, variant, price_centavos, serves, serving_basis, eligible) AS (
    VALUES
      ('value-belly', 'Value meal', 'Lechon belly (2 puso + soft drink)', 8000, 1, 'assumed', true),
      ('value-sisig', 'Value meal', 'Lechon sisig (2 puso + soft drink)', 8000, 1, 'assumed', true),
      ('value-flakes', 'Value meal', 'Lechon flakes (2 puso + soft drink)', 8000, 1, 'assumed', true),
      ('classic-quarter', 'Classic lechon belly', '¼ kg', 26500, NULL, 'unknown', false),
      ('classic-half', 'Classic lechon belly', '½ kg', 53000, NULL, 'unknown', false),
      ('classic-kilo', 'Classic lechon belly', '1 kg', 106000, NULL, 'unknown', false),
      ('spicy-quarter', 'Spicy lechon belly', '¼ kg', 27000, NULL, 'unknown', false),
      ('spicy-half', 'Spicy lechon belly', '½ kg', 54000, NULL, 'unknown', false),
      ('spicy-kilo', 'Spicy lechon belly', '1 kg', 108000, NULL, 'unknown', false),
      ('angus-baka', 'US Black Angus lechon baka and garlic rice', NULL, 48000, 2, 'printed', true),
      ('flakes-sharing', 'Lechon flakes', 'Good for 2', 20000, 2, 'printed', true),
      ('sisig-sharing', 'Sizzling sisig', 'Good for 2', 20000, 2, 'printed', true),
      ('dinuguan', 'Crispy dinuguan', NULL, 6000, NULL, 'unknown', false),
      ('bicol', 'Bicol Express', NULL, 6000, NULL, 'unknown', false),
      ('scallops', 'Scallops with garlic and cheese', NULL, 22000, NULL, 'unknown', false),
      ('puso', 'Puso (hanging rice)', 'Extra', 1000, NULL, 'unknown', false),
      ('soft-drink', 'Soft drink', 'Extra', 2500, NULL, 'unknown', false),
      ('water', 'Water', 'Extra', 2500, NULL, 'unknown', false),
      ('half-belly', 'Half belly', 'Approx. 2–2.5 kg', NULL, NULL, 'unknown', false),
      ('whole-belly', 'Whole belly', 'Approx. 4–5 kg', NULL, NULL, 'unknown', false)
)
INSERT INTO wanderapp.menu_items
    (place_id, item_id, name, variant, price_centavos, currency, serves, serving_basis, eligible, source_month, source_reference)
SELECT p.id, seed.item_id, seed.name, seed.variant, seed.price_centavos, 'PHP',
       seed.serves, seed.serving_basis, seed.eligible, '2026-11',
       'Tatang''s Extra Crispy Boneless Cebu Lechon menu photograph (November 2026)'
FROM seed CROSS JOIN wanderapp.places AS p
WHERE p.slug = 'tatangs-lechon'
ON CONFLICT (place_id, item_id) DO UPDATE SET
    name = excluded.name,
    variant = excluded.variant,
    price_centavos = excluded.price_centavos,
    serves = excluded.serves,
    eligible = excluded.eligible,
    serving_basis = excluded.serving_basis,
    source_month = excluded.source_month,
    source_reference = excluded.source_reference;

COMMIT;
