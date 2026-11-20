import type { Context } from 'hono';
import { Hono } from 'hono';
import { z } from 'zod';
import { auth, database } from '../auth.ts';

const emailSchema = z
  .email()
  .max(254)
  .transform((value) => value.trim().toLowerCase());
const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(100);
const metadataSchema = z.strictObject({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(1).max(3000),
  address: z.string().trim().min(2).max(500),
  locality: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  iconKey: slugSchema,
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  directionsUrl: z.url().refine((value) => value.startsWith('https://')),
  coverImageUrl: z
    .url()
    .refine((value) => value.startsWith('https://'))
    .nullable(),
});
const placeCreateSchema = metadataSchema.extend({ slug: slugSchema });
const menuSchema = z
  .strictObject({
    name: z.string().trim().min(1).max(160),
    variant: z.string().trim().max(160).nullable(),
    section: z.string().trim().min(1).max(70),
    priceCentavos: z.number().int().positive().max(100000000).nullable(),
    serves: z.number().int().min(1).max(100).nullable(),
    eligible: z.boolean(),
    available: z.boolean(),
    servingBasis: z.enum(['printed', 'assumed', 'unknown']),
  })
  .refine(
    (item) =>
      !item.eligible ||
      (item.priceCentavos !== null &&
        item.serves !== null &&
        item.servingBasis !== 'unknown'),
    {
      message:
        'Eligible items require a price and a known or explicitly assumed serving count',
    },
  );

interface IActor {
  id: string;
  email: string;
  admin: boolean;
}
interface IEnv {
  Variables: { actor: IActor; pool: NonNullable<typeof database> };
}

async function authorizedPlace(
  c: Context<IEnv>,
  slug: string,
): Promise<string | null> {
  const actor = c.get('actor');
  const result = await c.get('pool').query<{ id: string }>(
    `SELECT p.id FROM wanderapp.places p
     WHERE p.slug = $1 AND ($2::boolean OR EXISTS (
       SELECT 1 FROM wanderapp.place_owners o
       WHERE o.place_id = p.id AND o.email = $3
     ))`,
    [slug, actor.admin, actor.email],
  );
  return result.rows[0]?.id ?? null;
}

async function logChange(
  client: { query: (sql: string, values?: unknown[]) => Promise<unknown> },
  actor: IActor,
  placeId: string | null,
  action: string,
  details: unknown,
): Promise<void> {
  await client.query(
    `INSERT INTO wanderapp.management_audit(actor_user_id, actor_email, place_id, action, details)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [actor.id, actor.email, placeId, action, JSON.stringify(details)],
  );
}

export const manageRouter = new Hono<IEnv>();

manageRouter.use('*', async (c, next) => {
  if (auth === null || database === null) {
    return c.json({ error: 'Administration is not configured' }, 503);
  }
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (session?.user.emailVerified !== true) {
    return c.json({ error: 'Verified sign-in required' }, 401);
  }
  const email = session.user.email.trim().toLowerCase();
  const grants = await database.query<{ email: string }>(
    'SELECT email FROM wanderapp.admin_grants WHERE email = $1',
    [email],
  );
  c.set('actor', { id: session.user.id, email, admin: grants.rows.length > 0 });
  c.set('pool', database);
  await next();
});

manageRouter.get('/me', async (c) => {
  const actor = c.get('actor');
  const owned = await c.get('pool').query<{ slug: string; name: string }>(
    `SELECT p.slug, p.name FROM wanderapp.place_owners o
     JOIN wanderapp.places p ON p.id = o.place_id
     WHERE o.email = $1 ORDER BY p.name`,
    [actor.email],
  );
  return c.json({
    email: actor.email,
    role: actor.admin ? 'admin' : owned.rows.length > 0 ? 'owner' : 'member',
    managedPlaces: owned.rows,
  });
});

manageRouter.get('/places', async (c) => {
  const actor = c.get('actor');
  if (!actor.admin) {
    const hasOwner = await c
      .get('pool')
      .query<{ ok: boolean }>(
        'SELECT EXISTS(SELECT 1 FROM wanderapp.place_owners WHERE email = $1) AS ok',
        [actor.email],
      );
    if (hasOwner.rows[0]?.ok !== true) {
      return c.json({ places: [] });
    }
  }
  const result = await c.get('pool').query<Record<string, unknown>>(
    `SELECT p.slug, p.name, p.description, p.address, p.locality,
        p.category, p.directions_url AS "directionsUrl",
        p.cover_image_url AS "coverImageUrl",
        public.ST_X(p.location::public.geometry) AS longitude,
        public.ST_Y(p.location::public.geometry) AS latitude,
        f.icon_key AS "iconKey",
        COALESCE((SELECT jsonb_agg(jsonb_build_object(
           'id', m.item_id, 'name', m.name, 'variant', m.variant,
           'section', m.section, 'priceCentavos', m.price_centavos,
           'serves', m.serves, 'eligible', m.eligible, 'available', m.available,
           'servingBasis', m.serving_basis, 'currency', m.currency,
           'sourceMonth', m.source_month, 'sourceReference', m.source_reference
         ) ORDER BY m.section, m.name, m.item_id)
         FROM wanderapp.menu_items m WHERE m.place_id = p.id), '[]'::jsonb) AS "menuItems"
     FROM wanderapp.places p
     LEFT JOIN wanderapp.featured_places f ON f.place_id = p.id
     WHERE $1::boolean OR EXISTS (
       SELECT 1 FROM wanderapp.place_owners o WHERE o.place_id = p.id AND o.email = $2
     ) ORDER BY p.name`,
    [actor.admin, actor.email],
  );
  return c.json({ places: result.rows });
});

manageRouter.post('/places', async (c) => {
  const actor = c.get('actor');
  if (!actor.admin) {
    return c.json({ error: 'Administrator permission required' }, 403);
  }
  const body = placeCreateSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: 'Invalid place', details: body.error.issues }, 400);
  }
  const p = body.data;
  const client = await c.get('pool').connect();
  try {
    await client.query('BEGIN');
    const created = await client.query<{ id: string }>(
      `INSERT INTO wanderapp.places
        (slug, name, description, address, locality, country_code, location,
         directions_url, published_at, category, cover_image_url)
       VALUES ($1, $2, $3, $4, $5, 'PH',
         public.ST_SetSRID(public.ST_MakePoint($6, $7), 4326)::public.geography,
         $8, now(), $9, $10) RETURNING id`,
      [
        p.slug,
        p.name,
        p.description,
        p.address,
        p.locality,
        p.longitude,
        p.latitude,
        p.directionsUrl,
        p.category,
        p.coverImageUrl,
      ],
    );
    const id = created.rows[0]?.id;
    if (id === undefined) {
      throw new Error('Place insert returned no ID');
    }
    await client.query(
      'INSERT INTO wanderapp.featured_places(place_id, icon_key) VALUES($1, $2)',
      [id, p.iconKey],
    );
    await logChange(client, actor, id, 'place.created', { slug: p.slug });
    await client.query('COMMIT');
    return c.json({ slug: p.slug }, 201);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

manageRouter.patch('/places/:slug', async (c) => {
  const slug = slugSchema.safeParse(c.req.param('slug'));
  if (!slug.success) {
    return c.json({ error: 'Invalid place' }, 400);
  }
  const placeId = await authorizedPlace(c, slug.data);
  if (placeId === null) {
    return c.json({ error: 'Place not found or access denied' }, 403);
  }
  const body = metadataSchema.partial().safeParse(await c.req.json());
  if (!body.success) {
    return c.json(
      { error: 'Invalid changes', details: body.error.issues },
      400,
    );
  }
  if (Object.keys(body.data).length === 0) {
    return c.json({ error: 'No fields provided' }, 400);
  }
  const actor = c.get('actor');
  const client = await c.get('pool').connect();
  try {
    await client.query('BEGIN');
    const p = body.data;
    await client.query(
      `UPDATE wanderapp.places SET
        name = COALESCE($2, name), description = COALESCE($3, description),
        address = COALESCE($4, address), locality = COALESCE($5, locality),
        category = COALESCE($6, category),
        directions_url = COALESCE($7, directions_url),
        cover_image_url = CASE WHEN $8::boolean THEN $9 ELSE cover_image_url END,
        location = public.ST_SetSRID(public.ST_MakePoint(
          COALESCE($10, public.ST_X(location::public.geometry)),
          COALESCE($11, public.ST_Y(location::public.geometry))
        ), 4326)::public.geography,
        updated_at = now() WHERE id = $1`,
      [
        placeId,
        p.name ?? null,
        p.description ?? null,
        p.address ?? null,
        p.locality ?? null,
        p.category ?? null,
        p.directionsUrl ?? null,
        p.coverImageUrl !== undefined,
        p.coverImageUrl ?? null,
        p.longitude ?? null,
        p.latitude ?? null,
      ],
    );
    if (p.iconKey !== undefined) {
      await client.query(
        `INSERT INTO wanderapp.featured_places(place_id,icon_key) VALUES($1,$2)
         ON CONFLICT(place_id) DO UPDATE SET icon_key=excluded.icon_key`,
        [placeId, p.iconKey],
      );
    }
    await logChange(client, actor, placeId, 'place.updated', {
      fields: Object.keys(p),
    });
    await client.query('COMMIT');
    return c.json({ updated: true });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

manageRouter.put('/places/:slug/items/:itemId', async (c) => {
  const slug = slugSchema.safeParse(c.req.param('slug'));
  const itemId = slugSchema.safeParse(c.req.param('itemId'));
  if (!slug.success || !itemId.success) {
    return c.json({ error: 'Invalid identifier' }, 400);
  }
  const placeId = await authorizedPlace(c, slug.data);
  if (placeId === null) {
    return c.json({ error: 'Place not found or access denied' }, 403);
  }
  const body = menuSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json(
      { error: 'Invalid menu item', details: body.error.issues },
      400,
    );
  }
  const p = body.data;
  const actor = c.get('actor');
  const client = await c.get('pool').connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO wanderapp.menu_items
        (place_id, item_id, name, variant, price_centavos, currency, serves,
         eligible, serving_basis, source_month, source_reference, section, available)
       VALUES ($1, $2, $3, $4, $5, 'PHP', $6, $7, $8, '2026-11',
         'Updated by verified venue manager', $9, $10)
       ON CONFLICT(place_id, item_id) DO UPDATE SET
         name = excluded.name, variant = excluded.variant,
         price_centavos = excluded.price_centavos, serves = excluded.serves,
         eligible = excluded.eligible, serving_basis = excluded.serving_basis,
         source_month = excluded.source_month, source_reference = excluded.source_reference,
         section = excluded.section, available = excluded.available,
         updated_at = now()`,
      [
        placeId,
        itemId.data,
        p.name,
        p.variant,
        p.priceCentavos,
        p.serves,
        p.eligible,
        p.servingBasis,
        p.section,
        p.available,
      ],
    );
    await logChange(client, actor, placeId, 'menu.item.upserted', {
      itemId: itemId.data,
      priceCentavos: p.priceCentavos,
    });
    await client.query('COMMIT');
    return c.json({ saved: true, id: itemId.data });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

manageRouter.get('/admins', async (c) => {
  if (!c.get('actor').admin) {
    return c.json({ error: 'Administrator permission required' }, 403);
  }
  const result = await c
    .get('pool')
    .query<{ email: string }>(
      'SELECT email FROM wanderapp.admin_grants ORDER BY email',
    );
  return c.json({ admins: result.rows });
});

manageRouter.post('/admins', async (c) => {
  const actor = c.get('actor');
  if (!actor.admin) {
    return c.json({ error: 'Administrator permission required' }, 403);
  }
  const body = z
    .strictObject({ email: emailSchema })
    .safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ error: 'Valid email required' }, 400);
  }
  await c.get('pool').query(
    `INSERT INTO wanderapp.admin_grants(email, granted_by) VALUES($1,$2)
     ON CONFLICT(email) DO NOTHING`,
    [body.data.email, actor.id],
  );
  await c.get('pool').query(
    `INSERT INTO wanderapp.management_audit(actor_user_id,actor_email,action,details)
     VALUES($1,$2,'admin.granted',jsonb_build_object('email',$3::text))`,
    [actor.id, actor.email, body.data.email],
  );
  return c.json({ invited: true, email: body.data.email });
});

manageRouter.delete('/admins/:email', async (c) => {
  const actor = c.get('actor');
  if (!actor.admin) {
    return c.json({ error: 'Administrator permission required' }, 403);
  }
  const email = emailSchema.safeParse(decodeURIComponent(c.req.param('email')));
  if (!email.success) {
    return c.json({ error: 'Invalid email' }, 400);
  }
  if (email.data === actor.email || email.data === 'judigot@gmail.com') {
    return c.json(
      { error: 'Cannot revoke the current or bootstrap administrator' },
      403,
    );
  }
  await c
    .get('pool')
    .query('DELETE FROM wanderapp.admin_grants WHERE email = $1', [email.data]);
  return c.json({ revoked: true });
});

manageRouter.get('/places/:slug/owners', async (c) => {
  if (!c.get('actor').admin) {
    return c.json({ error: 'Administrator permission required' }, 403);
  }
  const result = await c.get('pool').query<{ email: string }>(
    `SELECT o.email FROM wanderapp.place_owners o
     JOIN wanderapp.places p ON p.id=o.place_id WHERE p.slug=$1 ORDER BY o.email`,
    [c.req.param('slug')],
  );
  return c.json({ owners: result.rows });
});

manageRouter.post('/places/:slug/owners', async (c) => {
  const actor = c.get('actor');
  if (!actor.admin) {
    return c.json({ error: 'Administrator permission required' }, 403);
  }
  const body = z
    .strictObject({ email: emailSchema })
    .safeParse(await c.req.json());
  const slug = slugSchema.safeParse(c.req.param('slug'));
  if (!body.success || !slug.success) {
    return c.json({ error: 'Valid place and email required' }, 400);
  }
  const result = await c
    .get('pool')
    .query<{ id: string }>('SELECT id FROM wanderapp.places WHERE slug = $1', [
      slug.data,
    ]);
  const placeId = result.rows[0]?.id;
  if (placeId === undefined) {
    return c.json({ error: 'Place not found' }, 404);
  }
  await c.get('pool').query(
    `INSERT INTO wanderapp.place_owners(place_id,email,granted_by)
     VALUES($1,$2,$3) ON CONFLICT(place_id,email) DO NOTHING`,
    [placeId, body.data.email, actor.id],
  );
  await c.get('pool').query(
    `INSERT INTO wanderapp.management_audit(actor_user_id,actor_email,place_id,action,details)
     VALUES($1,$2,$3,'place.owner.granted',jsonb_build_object('email',$4::text))`,
    [actor.id, actor.email, placeId, body.data.email],
  );
  return c.json({ invited: true, email: body.data.email });
});

manageRouter.delete('/places/:slug/owners/:email', async (c) => {
  const actor = c.get('actor');
  if (!actor.admin) {
    return c.json({ error: 'Administrator permission required' }, 403);
  }
  const email = emailSchema.safeParse(decodeURIComponent(c.req.param('email')));
  if (!email.success) {
    return c.json({ error: 'Invalid email' }, 400);
  }
  await c.get('pool').query(
    `DELETE FROM wanderapp.place_owners o USING wanderapp.places p
     WHERE o.place_id = p.id AND p.slug = $1 AND o.email = $2`,
    [c.req.param('slug'), email.data],
  );
  return c.json({ revoked: true });
});
