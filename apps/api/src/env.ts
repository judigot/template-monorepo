import { z } from 'zod';

/*
 * Environment contract, validated at the trust boundary per the
 * project's Zod-at-startup convention. Fail fast with a clear message
 * instead of misbehaving at request time.
 */
const EnvSchema = z.object({
  /** Comma-separated browser origins allowed by CORS. */
  CORS_ORIGINS: z
    .string()
    .trim()
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
    .optional(),

  /** Port for the local development server (unused on Vercel). */
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

export type IEnv = z.infer<typeof EnvSchema>;

export function parseEnv(source: NodeJS.ProcessEnv = process.env): IEnv {
  const result = EnvSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration — ${details}`);
  }

  return result.data;
}
