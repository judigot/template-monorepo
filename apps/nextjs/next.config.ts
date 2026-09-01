import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* The shared client ships TypeScript source, so Next.js must compile it. */
  transpilePackages: ['@bigbang/api-client'],
};

export default nextConfig;
