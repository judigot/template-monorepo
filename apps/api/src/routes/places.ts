import { Hono } from 'hono';
import { database } from '../auth.ts';

export const placesRouter = new Hono().get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  if (slug.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return c.json({ error: 'Invalid place slug' }, 400);
  }
  if (database === null) {
    return c.json({ error: 'Place catalog is not configured' }, 503);
  }

  const result = await database.query<Record<string, unknown>>(
    `SELECT p.slug, p.name, p.description, p.address, p.locality,
      public.ST_X(p.location::public.geometry) AS longitude,
      public.ST_Y(p.location::public.geometry) AS latitude,
      p.directions_url AS "directionsUrl",
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'slug', b.slug,
          'label', b.label,
          'edition', a.edition,
          'sourceUrl', a.source_url
        ) ORDER BY b.label, b.slug)
        FROM wanderapp.place_badges AS a
        JOIN wanderapp.badges AS b ON b.id = a.badge_id AND b.scope = a.scope
        WHERE a.place_id = p.id
      ), '[]'::jsonb) AS badges
    FROM wanderapp.places AS p
    WHERE p.slug = $1 AND p.published_at <= now()`,
    [slug],
  );

  const place = result.rows[0];
  if (place === undefined) {
    return c.json({ error: 'Place not found' }, 404);
  }
  c.header('Cache-Control', 'public, max-age=60');
  return c.json(place);
});
