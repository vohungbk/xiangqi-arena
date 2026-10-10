import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { SideNav } from '@/components/layout/SideNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Xiangqi Arena',
  description: 'Play real-time online Xiangqi',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
        <AppHeader />
        <div className="flex flex-1">
          <SideNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
