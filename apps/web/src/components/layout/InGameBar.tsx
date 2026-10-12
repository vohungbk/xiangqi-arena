'use client';

import { LogOut } from 'lucide-react';
import { useShellStore } from '@/store/useShellStore';
import { LogoMark } from './LogoMark';

const APP_NAME = 'Xiangqi Arena';

/**
 * The only bar at the top during a live game (ENG-F07 R13): the logo and [Rời Đi]. The board,
 * the clocks and the player cards get the rest of the room. It has no breakpoint classes, so
 * it stays when the window crosses 1024 px (E10).
 *
 * The logo does not link to Home here. Both the logo and [Rời Đi] open the leave modal (Nav-6).
 */
export function InGameBar() {
  const inGame = useShellStore((state) => state.inGame);
  const openLeaveModal = useShellStore((state) => state.openLeaveModal);

  if (!inGame) return null;

  return (
    <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
      <button
        type="button"
        aria-label={`${APP_NAME} - Rời ván`}
        onClick={openLeaveModal}
        className="flex min-h-[44px] items-center gap-3 rounded-lg"
      >
        <LogoMark sizeClass="h-11 w-11" />
        <span className="text-lg font-bold leading-tight">{APP_NAME}</span>
      </button>
      <button
        type="button"
        onClick={openLeaveModal}
        className="flex min-h-[44px] items-center gap-2 rounded-lg border border-danger px-4 text-sm font-semibold text-danger hover:bg-surface"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Rời Đi
      </button>
    </header>
  );
}
