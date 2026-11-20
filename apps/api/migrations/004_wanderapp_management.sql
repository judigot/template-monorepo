BEGIN;

-- Administrator grants are pending email invitations until verified sign-in.
-- Never grant roles based on a client-supplied email or an unverified session.
CREATE TABLE IF NOT EXISTS wanderapp.admin_grants (
  email text PRIMARY KEY CHECK (email = lower(btrim(email)) AND email LIKE '%@%'),
  granted_by text REFERENCES public."user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO wanderapp.admin_grants(email) VALUES ('judigot@gmail.com')
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS wanderapp.place_owners (
  place_id uuid NOT NULL REFERENCES wanderapp.places(id) ON DELETE CASCADE,
  email text NOT NULL CHECK (email = lower(btrim(email)) AND email LIKE '%@%'),
  granted_by text REFERENCES public."user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (place_id, email)
);
CREATE INDEX IF NOT EXISTS place_owners_email_idx ON wanderapp.place_owners (email);

ALTER TABLE wanderapp.places ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Restaurant';
ALTER TABLE wanderapp.places ADD COLUMN IF NOT EXISTS cover_image_url text CHECK (cover_image_url IS NULL OR cover_image_url LIKE 'https://%');
ALTER TABLE wanderapp.places ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE wanderapp.menu_items ADD COLUMN IF NOT EXISTS section text NOT NULL DEFAULT 'Menu';
ALTER TABLE wanderapp.menu_items ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;
ALTER TABLE wanderapp.menu_items ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS wanderapp.management_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id text REFERENCES public."user"(id) ON DELETE SET NULL,
  actor_email text NOT NULL,
  place_id uuid REFERENCES wanderapp.places(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS management_audit_place_time_idx
 ON wanderapp.management_audit (place_id, created_at DESC);

-- Correct prior mistaken seed only when it still retains the original wrong price.
UPDATE wanderapp.menu_items
SET price_centavos = 18000, source_month = '2026-08',
    source_reference = 'Tatang''s menu photograph (August 2026)',
    updated_at = now()
WHERE item_id IN ('value-belly', 'value-sisig', 'value-flakes')
 AND price_centavos = 8000
 AND place_id IN (SELECT id FROM wanderapp.places WHERE slug = 'tatangs-lechon');

COMMIT;
