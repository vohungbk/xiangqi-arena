'use client';

import { Bell } from 'lucide-react';
import { useSessionStore } from '@/store/useSessionStore';
import { UserMenu } from './UserMenu';

/** Right side of the header: the bell, the Avatar, the Username and the Rating (ENG-F07 R6). */
export function UserBlock() {
  const user = useSessionStore((state) => state.user);
  const clearUser = useSessionStore((state) => state.clearUser);

  if (!user) return null;

  const hasUnread = user.unreadCount > 0;

  return (
    <div className="flex items-center gap-4">
      {/* The inbox is owned by USR-F03. The shell only gives the place and the mark. */}
      <button
        type="button"
        aria-label={hasUnread ? `Thông báo, ${user.unreadCount} chưa đọc` : 'Thông báo'}
        className="relative rounded-lg p-2 text-fg-muted hover:bg-surface"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {hasUnread ? (
          <span
            data-testid="unread-mark"
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold"
          />
        ) : null}
      </button>
      <UserMenu user={user} onLogout={clearUser} />
    </div>
  );
}
