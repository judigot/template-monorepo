import { FrameworkBadge } from '@/app/framework-badge.tsx';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-500 to-teal-600">
      <div className="bg-white/90 rounded-3xl shadow-2xl px-10 py-16">
        <FrameworkBadge />
        <output className="block text-2xl text-center text-gray-500">
          Loading…
        </output>
      </div>
    </div>
  );
}
