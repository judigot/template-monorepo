import { describe, expect, it } from 'bun:test';
import { parseAuthEnvironment } from '../src/auth-env.ts';

const VALID = {
  DATABASE_URL: 'postgresql://user:pass@db.example.com:5432/travel',
  BETTER_AUTH_URL: 'https://api.example.com',
  BETTER_AUTH_SECRET: 'a-secret-longer-than-thirty-two-characters',
  GOOGLE_CLIENT_ID: 'google-client',
  GOOGLE_CLIENT_SECRET: 'google-secret',
};

describe('Better Auth environment', () => {
  it('keeps the template usable if auth is entirely unconfigured', () => {
    expect(parseAuthEnvironment({})).toBeNull();
  });

  it('accepts a fully configured PostgreSQL and Google OAuth integration', () => {
    expect(parseAuthEnvironment(VALID)).toEqual(VALID);
  });

  it('rejects partial configuration instead of silently disabling auth', () => {
    expect(() =>
      parseAuthEnvironment({ GOOGLE_CLIENT_ID: 'configured-without-secret' }),
    ).toThrow('Invalid Better Auth environment');
  });

  it('rejects short signing secrets', () => {
    expect(() =>
      parseAuthEnvironment({ ...VALID, BETTER_AUTH_SECRET: 'short' }),
    ).toThrow('BETTER_AUTH_SECRET');
  });

  it('rejects non-TLS public callback URLs', () => {
    expect(() =>
      parseAuthEnvironment({
        ...VALID,
        BETTER_AUTH_URL: 'http://api.example.com',
      }),
    ).toThrow('BETTER_AUTH_URL');
  });
});
