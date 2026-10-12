import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  unreadCount: number;
  /** Extra classes, for example a bigger touch target in the compact header. */
  className?: string;
}

/**
 * The bell of the header (ENG-F07 R6). The inbox is owned by USR-F03:
 * the shell only gives the place and the unread mark.
 */
export function NotificationBell({ unreadCount, className }: NotificationBellProps) {
  const hasUnread = unreadCount > 0;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={hasUnread ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo'}
      className={cn('relative min-h-0 size-9 text-fg-muted', className)}
    >
      <Bell className="size-5" aria-hidden="true" />
      {hasUnread ? (
        <span
          data-testid="unread-mark"
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 size-2 rounded-full bg-gold"
        />
      ) : null}
    </Button>
  );
}
