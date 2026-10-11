'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { HOME_HREF, LOGIN_HREF } from '@/lib/nav-items';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';
import { LogoMark } from './LogoMark';
import { NotificationBell } from './NotificationBell';
import { OnlineBadge } from './OnlineBadge';
import { UserMenu } from './UserMenu';

/** Button under the header. It toggles the drawer, which story S11 builds. */
function DrawerButton() {
  const drawerOpen = useShellStore((state) => state.drawerOpen);
  const toggleDrawer = useShellStore((state) => state.toggleDrawer);

  return (
    <button
      type="button"
      aria-expanded={drawerOpen}
      onClick={toggleDrawer}
      className="flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-sm font-medium hover:bg-surface"
    >
      <Menu className="h-5 w-5" aria-hidden="true" />
      Danh mục
    </button>
  );
}

function CompactOnlineBadge() {
  return <OnlineBadge count={useShellStore((state) => state.onlinePlayers)} />;
}

/**
 * Header below 1024 px (ENG-F07 R10, R22): the logo, the online badge, the bell and the Avatar,
 * and the button "Danh mục" under it. The language button and the Username live in the
 * drawer (ASM01, story S11).
 */
export function CompactHeader() {
  const user = useSessionStore((state) => state.user);
  const clearUser = useSessionStore((state) => state.clearUser);

  return (
    <div className="lg:hidden">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <Link href={HOME_HREF} aria-label="Xiangqi Arena - Trang Chủ" className="shrink-0">
          <LogoMark sizeClass="h-11 w-11" />
        </Link>
        <div className="flex items-center gap-2">
          <CompactOnlineBadge />
          {user ? (
            <div className="flex items-center gap-1">
              <NotificationBell
                unreadCount={user.unreadCount}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center"
              />
              <UserMenu user={user} onLogout={clearUser} compact />
            </div>
          ) : (
            <Link
              href={LOGIN_HREF}
              className="flex min-h-[44px] items-center rounded-lg bg-primary px-3 text-sm font-semibold"
            >
              Đăng Nhập / Đăng Ký
            </Link>
          )}
        </div>
      </header>
      <div className="border-b border-line px-4 py-2">
        <DrawerButton />
      </div>
    </div>
  );
}
