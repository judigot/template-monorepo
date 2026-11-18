import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { parseAuthEnvironment } from './auth-env.ts';
import { resolveAllowedOrigins } from './app-origins.ts';

const config = parseAuthEnvironment();

/*
 * An unconfigured example template must remain usable without secrets.
 * Once any auth variable is set, auth-env.ts requires the complete set.
 * The user and session tables must be migrated before enabling the endpoint.
 */
export const auth =
  config === null
    ? null
    : betterAuth({
        baseURL: config.BETTER_AUTH_URL,
        secret: config.BETTER_AUTH_SECRET,
        database: new Pool({
          connectionString: config.DATABASE_URL,
          max: 5,
        }),
        plugins: [expo()],
        trustedOrigins: [
          'roamtravel://',
          ...resolveAllowedOrigins(),
        ],
        socialProviders: {
          google: {
            clientId: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
          },
        },
      });
