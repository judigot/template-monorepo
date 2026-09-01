'use client';

import { useEffect } from 'react';
import { FrameworkBadge } from '@/app/framework-badge.tsx';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-500 to-teal-600">
      <div className="bg-white/90 rounded-3xl shadow-2xl px-10 py-16 text-center">
        <FrameworkBadge />
        <p className="text-2xl text-red-600" role="alert">
          Could not reach the API.
        </p>
        <button
          type="button"
          className="mt-6 rounded-full bg-teal-600 px-6 py-2 text-white font-semibold hover:bg-teal-700"
          onClick={() => {
            reset();
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
