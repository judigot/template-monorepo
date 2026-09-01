import { describe, expect, it } from 'bun:test';
import { parseEnv } from '../src/env.ts';

describe('parseEnv', () => {
  it('applies defaults when nothing is configured', () => {
    const env = parseEnv({});
    expect(env.PORT).toBe(3000);
    expect(env.CORS_ORIGINS).toBeUndefined();
  });

  it('parses a comma-separated CORS_ORIGINS list of full origins', () => {
    const env = parseEnv({
      CORS_ORIGINS: 'https://vite.example.com, https://nextjs.example.com',
    });
    expect(env.CORS_ORIGINS).toEqual([
      'https://vite.example.com',
      'https://nextjs.example.com',
    ]);
  });

  it('treats an empty PORT as unset so Vercel functions can boot', () => {
    const env = parseEnv({
      PORT: '',
      VERCEL: '1',
      CORS_ORIGINS: 'https://template-monorepo-vite.vercel.app',
    });
    expect(env.PORT).toBe(3000);
    expect(env.CORS_ORIGINS).toEqual([
      'https://template-monorepo-vite.vercel.app',
    ]);
  });

  it('rejects CORS_ORIGINS entries that are not full origins', () => {
    let caught: unknown;
    try {
      parseEnv({ CORS_ORIGINS: 'vite.example.com' });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    if (caught instanceof Error) {
      expect(caught.message).toContain('CORS_ORIGINS');
    }
  });

  it('rejects an out-of-range PORT', () => {
    let caught: unknown;
    try {
      parseEnv({ PORT: '70000' });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    if (caught instanceof Error) {
      expect(caught.message).toContain('PORT');
    }
  });
});
