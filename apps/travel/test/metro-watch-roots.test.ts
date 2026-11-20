import { describe, expect, it } from 'bun:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const metroConfig: unknown = createRequire(import.meta.url)(
  '../metro.config.cjs',
);

describe('Metro filesystem watch scope', () => {
  it('watches shared source without crawling the Bun dependency store', () => {
    expect(metroConfig).toMatchObject({
      watchFolders: [
        resolve(import.meta.dir, '../../../packages/design-tokens'),
      ],
    });
  });
});
