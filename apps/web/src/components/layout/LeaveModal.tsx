'use client';

import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LiveGameKind } from '@/lib/live-game-kind';
import { HOME_HREF } from '@/lib/nav-items';
import { useRestoreFocus } from '@/lib/use-restore-focus';
import { useShellStore } from '@/store/useShellStore';

export const LEAVE_MODAL_TEXT = 'Ván đấu đang diễn ra. Bạn có chắc chắn muốn rời đi?';
export const LEAVE_CONFIRM_LABEL = 'Rời Đi';
export const LEAVE_CANCEL_LABEL = 'Ở Lại';

/**
 * Confirmation before the player leaves a live AI or local game (ENG-F07 R17, Nav-6 to Nav-8).
 * The unfinished game is lost, so the player has to confirm. Cancel and Esc keep the game going.
 * The online game has its own story, so this modal stays closed for it. The leave sends no
 * WebSocket event: an AI or local game never touches the server and never changes the Rating.
 *
 * It is a shadcn/ui AlertDialog (Radix): it traps the focus, starts on the safe choice, locks
 * the page scroll and returns the focus to the element that opened it. A click on the dimmed
 * area does not close it, as an alert dialog asks for an explicit answer.
 */
export function LeaveModal() {
  const router = useRouter();
  const kind = useShellStore((state) => state.liveGameKind);
  const requested = useShellStore((state) => state.leaveModalOpen);
  const closeLeaveModal = useShellStore((state) => state.closeLeaveModal);
  const confirmLeave = useShellStore((state) => state.confirmLeave);
  const { rememberOpener, restoreOpener } = useRestoreFocus();

  // A screen with no kind still asks, so the logo and [Rời Đi] never look dead.
  const open = requested && kind !== LiveGameKind.ONLINE;

  const onConfirm = () => {
    // A second click finds the modal closed and does nothing.
    if (confirmLeave()) router.push(HOME_HREF);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeLeaveModal();
      }}
    >
      <AlertDialogContent
        className="z-60"
        onOpenAutoFocus={rememberOpener}
        onCloseAutoFocus={restoreOpener}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="sr-only">Rời ván đấu</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-foreground">
            {LEAVE_MODAL_TEXT}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{LEAVE_CANCEL_LABEL}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {LEAVE_CONFIRM_LABEL}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
