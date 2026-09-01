import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Next.js Frontend',
  description: 'Next.js frontend consuming the shared Hono API',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
