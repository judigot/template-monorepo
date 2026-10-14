/**
 * Optional Next.js route helper for public, unauthenticated, read-only JSON.
 * Use only for information intentionally published to everyone.
 */
export const PUBLIC_GET_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Content-Type',
  'Access-Control-Max-Age': '86400',
  'X-Content-Type-Options': 'nosniff',
} as const;

export interface IPublicJsonOptions {
  status?: number;
  cacheSeconds?: number;
}

export function publicJson(
  data: unknown,
  { status = 200, cacheSeconds = 30 }: IPublicJsonOptions = {},
): Response {
  const cacheControl =
    status >= 400
      ? 'no-store'
      : `public, max-age=${String(cacheSeconds)}, s-maxage=${String(cacheSeconds)}, stale-while-revalidate=300`;

  return Response.json(data, {
    status,
    headers: { ...PUBLIC_GET_HEADERS, 'Cache-Control': cacheControl },
  });
}

export function publicOptions(): Response {
  return new Response(null, { status: 204, headers: PUBLIC_GET_HEADERS });
}
