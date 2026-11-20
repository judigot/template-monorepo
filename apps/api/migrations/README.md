# Wanderapp place catalog

Run these migrations in order with a direct connection to the target Neon
branch. The Better Auth migration must have created `public."user"` before
the catalog migration runs. Apply the numbered schema migration once per
database. The second migration is an optional, repeatable demo seed. Apply migration 003 after 002, and rerun 003 to refresh the November 2026 Tatang's menu.

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/api/migrations/001_wanderapp_places.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/api/migrations/002_seed_tatangs.sql\npsql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/api/migrations/003_wanderapp_explore_menu.sql
```

The catalog lives in the `wanderapp` schema. A published place has a stable
URL slug and a PostGIS point in WGS 84. The partial GiST index supports
proximity queries expressed with `ST_DWithin` and the published-place predicate.
Badge definitions are reused across awards. Composite foreign keys enforce
whether a badge may be awarded to a place or an existing Better Auth user.
The assignment tables prevent duplicate awards and index the badge reference.
Place awards can include a guide edition and a source URL.

The API uses the existing server-side Postgres pool. Only published place
profiles are served by the public `GET /api/places/:slug` route. The curated collection with priced menu items is served by `GET /api/places`; only places added to `wanderapp.featured_places` appear there. Profile badge
awards have no public endpoint.
