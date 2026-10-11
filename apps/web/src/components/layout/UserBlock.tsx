'use client';

import { useSessionStore } from '@/store/useSessionStore';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';

/** Right side of the header: the bell, the Avatar, the Username and the Rating (ENG-F07 R6). */
export function UserBlock() {
  const user = useSessionStore((state) => state.user);
  const clearUser = useSessionStore((state) => state.clearUser);

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <NotificationBell unreadCount={user.unreadCount} />
      <UserMenu user={user} onLogout={clearUser} />
    </div>
  );
}
