'use client';

import { useEffect } from 'react';
import { useShellStore, type Toast } from '@/store/useShellStore';

/** How long a toast stays before it goes away. */
export const TOAST_DURATION_MS = 4000;

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useShellStore((state) => state.dismissToast);

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast.id, dismissToast]);

  return (
    <div
      data-testid="toast"
      className="pointer-events-auto rounded-lg border border-line bg-surface px-4 py-3 text-sm text-fg shadow-lg"
    >
      {toast.message}
    </div>
  );
}

/**
 * Small toasts at the top right (ENG-F07 R13, E11). In a live game they replace the bell, so
 * they must not hide the board: they are narrow, stacked and let the pointer through around
 * them. They sit under the in-game bar (top-20), so they never cover [Rời Đi]. The text is
 * plain text and is never parsed as HTML.
 */
export function ToastRegion() {
  const toasts = useShellStore((state) => state.toasts);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-20 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
