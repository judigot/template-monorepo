import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* The shared client ships TypeScript source, so Next.js must compile it. */
  transpilePackages: [
    '@monorepo/api-client',
    '@monorepo/components',
    '@monorepo/design-system',
    '@monorepo/design-tokens',
  ],
};

export default nextConfig;
