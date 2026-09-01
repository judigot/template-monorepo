import { getHello } from '@bigbang/api-client';
import { FrameworkBadge } from '@/app/framework-badge.tsx';

/*
 * The API is called on every request instead of at build time, so
 * `next build` succeeds without a running API server.
 */
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.API_URL ?? 'http://localhost:3000';

export default async function HomePage() {
  const hello = await getHello({ baseUrl: API_BASE_URL });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-500 to-teal-600">
      <div className="bg-white/90 rounded-3xl shadow-2xl px-10 py-16">
        <FrameworkBadge />
        <h1 className="text-5xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 drop-shadow-lg tracking-tight">
          {hello.message}
        </h1>
      </div>
    </div>
  );
}
