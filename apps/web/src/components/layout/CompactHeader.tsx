'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HOME_HREF, LOGIN_HREF } from '@/lib/nav-items';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';
import { CategoryDrawer } from './CategoryDrawer';
import { LogoMark } from './LogoMark';
import { NotificationBell } from './NotificationBell';
import { OnlineBadge } from './OnlineBadge';
import { UserMenu } from './UserMenu';

/** Button under the header. It toggles the drawer. */
function DrawerButton() {
  const drawerOpen = useShellStore((state) => state.drawerOpen);
  const toggleDrawer = useShellStore((state) => state.toggleDrawer);

  return (
    <Button
      type="button"
      variant="ghost"
      aria-expanded={drawerOpen}
      onClick={toggleDrawer}
      className="px-2"
    >
      <Menu className="size-5" aria-hidden="true" />
      Danh mục
    </Button>
  );
}

function CompactOnlineBadge() {
  return <OnlineBadge count={useShellStore((state) => state.onlinePlayers)} />;
}

/**
 * Header below 1024 px (ENG-F07 R10, R22): the logo, the online badge, the bell and the Avatar,
 * and the button "Danh mục" under it. The language button lives in the drawer (R11).
 */
export function CompactHeader() {
  const user = useSessionStore((state) => state.user);
  const clearUser = useSessionStore((state) => state.clearUser);
  const inGame = useShellStore((state) => state.inGame);

  // A live game shows the in-game bar instead (ENG-F07 R13).
  if (inGame) return null;

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
                className="min-h-[44px] min-w-[44px]"
              />
              <UserMenu user={user} onLogout={clearUser} compact />
            </div>
          ) : (
            <Button asChild className="px-3 font-semibold">
              <Link href={LOGIN_HREF}>Đăng Nhập / Đăng Ký</Link>
            </Button>
          )}
        </div>
      </header>
      <div className="border-b border-line px-4 py-2">
        <DrawerButton />
      </div>
      <CategoryDrawer />
    </div>
  );
}
