import { z } from 'zod';

const AuthEnvironmentSchema = z.object({
  DATABASE_URL: z
    .url()
    .refine(
      (value) =>
        value.startsWith('postgres://') || value.startsWith('postgresql://'),
      'DATABASE_URL must use the postgres or postgresql protocol',
    ),
  BETTER_AUTH_URL: z
    .url()
    .refine(
      (value) =>
        value.startsWith('https://') || value.startsWith('http://localhost:'),
      'BETTER_AUTH_URL must use HTTPS outside localhost',
    ),
  BETTER_AUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

export type IAuthEnvironment = z.infer<typeof AuthEnvironmentSchema>;

const KEYS = [
  'DATABASE_URL',
  'BETTER_AUTH_URL',
  'BETTER_AUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
] as const;

export function parseAuthEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): IAuthEnvironment | null {
  if (KEYS.every((key) => !source[key]?.trim())) {
    return null;
  }

  const result = AuthEnvironmentSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => issue.path.join('.') + ': ' + issue.message)
      .join('; ');
    throw new Error('Invalid Better Auth environment: ' + problems);
  }

  return result.data;
}
