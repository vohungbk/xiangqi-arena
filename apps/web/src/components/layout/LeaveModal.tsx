'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef } from 'react';
import { trapTab } from '@/lib/focus-trap';
import { LiveGameKind } from '@/lib/live-game-kind';
import { HOME_HREF } from '@/lib/nav-items';
import { useShellStore } from '@/store/useShellStore';

export const LEAVE_MODAL_TEXT = 'Ván đấu đang diễn ra. Bạn có chắc chắn muốn rời đi?';
export const LEAVE_CONFIRM_LABEL = 'Rời Đi';
export const LEAVE_CANCEL_LABEL = 'Ở Lại';

/**
 * Confirmation before the player leaves a live AI or local game (ENG-F07 R17, Nav-6 to Nav-8).
 * The unfinished game is lost, so the player has to confirm. Cancel, Esc and a click on the
 * dimmed area keep the game going. The online game has its own story, so this modal stays
 * closed for it. The leave sends no WebSocket event: an AI or local game never touches the
 * server and never changes the Rating.
 */
export function LeaveModal() {
  const router = useRouter();
  const kind = useShellStore((state) => state.liveGameKind);
  const requested = useShellStore((state) => state.leaveModalOpen);
  const closeLeaveModal = useShellStore((state) => state.closeLeaveModal);
  const confirmLeave = useShellStore((state) => state.confirmLeave);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const textId = useId();

  // A screen with no kind still asks, so the logo and [Rời Đi] never look dead.
  const open = requested && kind !== LiveGameKind.ONLINE;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const panel = panelRef.current;
    // Focus starts on the safe choice.
    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLeaveModal();
      else if (event.key === 'Tab' && panel) trapTab(event, panel);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open, closeLeaveModal]);

  if (!open) return null;

  const onConfirm = () => {
    // A second click finds the modal closed and does nothing.
    if (confirmLeave()) router.push(HOME_HREF);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        data-testid="leave-backdrop"
        aria-hidden="true"
        onClick={closeLeaveModal}
        className="absolute inset-0 bg-app opacity-70"
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-describedby={textId}
        className="relative w-full max-w-sm rounded-lg border border-line bg-surface p-5"
      >
        <p id={textId} className="text-base text-fg">
          {LEAVE_MODAL_TEXT}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={closeLeaveModal}
            className="min-h-[44px] rounded-lg border border-line px-4 text-sm font-semibold text-fg hover:bg-surface-inset"
          >
            {LEAVE_CANCEL_LABEL}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] rounded-lg border border-danger px-4 text-sm font-semibold text-danger hover:bg-surface-inset"
          >
            {LEAVE_CONFIRM_LABEL}
          </button>
        </div>
      </div>
    </div>
  );
}
