'use client';

import { Info } from 'lucide-react';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';

export const EMAIL_BANNER_TEXT = 'Xác thực email ngay để mở khóa chế độ Đấu Xếp Hạng (Ranked).';

/**
 * Full-width place under the header for the reminder banner (ENG-F07 R9).
 * The shell only keeps the place. The banner content is owned by USR-F01 (R18).
 * With no banner the place renders nothing and takes no height.
 */
export function BannerSlot() {
  const user = useSessionStore((state) => state.user);
  const inGame = useShellStore((state) => state.inGame);

  if (inGame || !user || user.emailVerified) return null;

  return (
    <div role="status" className="w-full border-b border-line bg-surface-selected px-6 py-3">
      <p className="flex items-center gap-3 text-sm text-fg">
        <Info className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        {EMAIL_BANNER_TEXT}
      </p>
    </div>
  );
}
