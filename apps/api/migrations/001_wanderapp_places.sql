BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
CREATE SCHEMA wanderapp;

CREATE TABLE wanderapp.places (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    name text NOT NULL CHECK (btrim(name) <> ''),
    description text NOT NULL CHECK (btrim(description) <> ''),
    address text NOT NULL CHECK (btrim(address) <> ''),
    locality text NOT NULL CHECK (btrim(locality) <> ''),
    country_code text NOT NULL CHECK (country_code ~ '^[A-Z]{2}$'),
    location public.geography(Point, 4326) NOT NULL CHECK (NOT public.ST_IsEmpty(location::public.geometry)),
    directions_url text NOT NULL CHECK (directions_url LIKE 'https://%'),
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- The public map's viewport and distance queries can use this index.
CREATE INDEX places_published_location_idx ON wanderapp.places USING gist (location)
    WHERE published_at IS NOT NULL;

CREATE TYPE wanderapp.badge_scope AS ENUM ('place', 'profile');

CREATE TABLE wanderapp.badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scope wanderapp.badge_scope NOT NULL,
    slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    label text NOT NULL CHECK (btrim(label) <> ''),
    UNIQUE (scope, slug),
    UNIQUE (id, scope)
);

CREATE TABLE wanderapp.place_badges (
    place_id uuid NOT NULL REFERENCES wanderapp.places(id) ON DELETE CASCADE,
    badge_id uuid NOT NULL,
    scope wanderapp.badge_scope GENERATED ALWAYS AS ('place'::wanderapp.badge_scope) STORED,
    edition smallint CHECK (edition >= 1900),
    source_url text CHECK (source_url LIKE 'https://%'),
    awarded_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (place_id, badge_id),
    FOREIGN KEY (badge_id, scope) REFERENCES wanderapp.badges(id, scope)
);

CREATE INDEX place_badges_badge_idx ON wanderapp.place_badges (badge_id, scope);

CREATE TABLE wanderapp.profile_badges (
    user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
    badge_id uuid NOT NULL,
    scope wanderapp.badge_scope GENERATED ALWAYS AS ('profile'::wanderapp.badge_scope) STORED,
    earned_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, badge_id),
    FOREIGN KEY (badge_id, scope) REFERENCES wanderapp.badges(id, scope)
);

CREATE INDEX profile_badges_badge_idx ON wanderapp.profile_badges (badge_id, scope);

COMMIT;
