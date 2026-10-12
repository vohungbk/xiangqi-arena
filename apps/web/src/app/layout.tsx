import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BannerSlot } from '@/components/layout/BannerSlot';
import { BottomNav } from '@/components/layout/BottomNav';
import { CompactHeader } from '@/components/layout/CompactHeader';
import { InGameBar } from '@/components/layout/InGameBar';
import { LeaveModal } from '@/components/layout/LeaveModal';
import { SideNav } from '@/components/layout/SideNav';
import { ToastRegion } from '@/components/layout/ToastRegion';
import '@fontsource-variable/inter';
import './globals.css';

export const metadata: Metadata = {
  title: 'Xiangqi Arena',
  description: 'Play real-time online Xiangqi',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col bg-app font-sans text-fg">
        <AppHeader />
        <CompactHeader />
        <InGameBar />
        <BannerSlot />
        <div className="flex flex-1">
          <SideNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
        <BottomNav />
        <ToastRegion />
        <LeaveModal />
      </body>
    </html>
  );
}
