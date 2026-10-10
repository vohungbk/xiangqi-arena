import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Xiangqi Arena',
  description: 'Play real-time online Xiangqi',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
