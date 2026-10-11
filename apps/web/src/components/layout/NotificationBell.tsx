import { Bell } from 'lucide-react';

interface NotificationBellProps {
  unreadCount: number;
  /** Extra classes, for example a bigger touch target in the compact header. */
  className?: string;
}

/**
 * The bell of the header (ENG-F07 R6). The inbox is owned by USR-F03:
 * the shell only gives the place and the unread mark.
 */
export function NotificationBell({ unreadCount, className = '' }: NotificationBellProps) {
  const hasUnread = unreadCount > 0;

  return (
    <button
      type="button"
      aria-label={hasUnread ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo'}
      className={`relative rounded-lg p-2 text-fg-muted hover:bg-surface ${className}`.trimEnd()}
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
  );
}
