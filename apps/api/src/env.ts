import { z } from 'zod';

/*
 * Environment contract, validated at the trust boundary per the
 * project's Zod-at-startup convention. Empty strings are treated as
 * unset: Vercel defines PORT="" on functions, which must not fail boot.
 */
function emptyToUndefined(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === '') {
    return undefined;
  }
  return value;
}

const CorsOriginsSchema = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin !== ''),
  )
  .pipe(
    z.array(
      z.url({
        error:
          'CORS_ORIGINS entries must be full origins, e.g. https://app.example.com',
      }),
    ),
  )
  .optional();

const PortSchema = z.coerce.number().int().min(1).max(65535).default(3000);

export interface IEnv {
  CORS_ORIGINS: string[] | undefined;
  PORT: number;
}

export function parseCorsOrigins(
  source: NodeJS.ProcessEnv = process.env,
): string[] | undefined {
  const result = CorsOriginsSchema.safeParse(
    emptyToUndefined(source.CORS_ORIGINS),
  );

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => issue.message)
      .join('; ');
    throw new Error(`Invalid CORS_ORIGINS — ${details}`);
  }

  return result.data;
}

export function parsePort(source: NodeJS.ProcessEnv = process.env): number {
  const result = PortSchema.safeParse(emptyToUndefined(source.PORT));

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => issue.message)
      .join('; ');
    throw new Error(`Invalid PORT — ${details}`);
  }

  return result.data;
}

export function parseEnv(source: NodeJS.ProcessEnv = process.env): IEnv {
  return {
    CORS_ORIGINS: parseCorsOrigins(source),
    PORT: parsePort(source),
  };
}
