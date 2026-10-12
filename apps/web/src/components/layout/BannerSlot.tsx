'use client';

import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';

const EMAIL_BANNER_TEXT = 'Xác thực email ngay để mở khóa chế độ Đấu Xếp Hạng (Ranked).';

/**
 * Full-width place under the header for the reminder banner (ENG-F07 R9).
 * The shell only keeps the place. The banner content is owned by USR-F01 (R18).
 * With no banner the place renders nothing and takes no height.
 */
export function BannerSlot() {
  // Select one boolean, so a change of the rating or the inbox does not render the slot again.
  const emailUnverified = useSessionStore((state) => state.user?.emailVerified === false);
  const inGame = useShellStore((state) => state.inGame);

  if (inGame || !emailUnverified) return null;

  return (
    <Alert
      role="status"
      className="w-full items-center rounded-none border-x-0 border-t-0 bg-surface-selected px-6 py-3"
    >
      <Info className="text-primary" aria-hidden="true" />
      <AlertDescription className="text-foreground">{EMAIL_BANNER_TEXT}</AlertDescription>
    </Alert>
  );
}
