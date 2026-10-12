'use client';

import { useRef } from 'react';

/**
 * Gives the focus back to the element that had it when a Radix dialog opened.
 *
 * Radix returns the focus to its own `Trigger`. The drawer and the leave modal are opened from
 * the shell store, by a button or by the in-game bar, so they have no Radix `Trigger` and the
 * focus would fall to the page body. Pass the two handlers to the dialog content.
 */
export function useRestoreFocus() {
  const openerRef = useRef<HTMLElement | null>(null);

  return {
    /** Remembers the element that has the focus before the dialog takes it. */
    rememberOpener: () => {
      const active = document.activeElement;
      openerRef.current = active instanceof HTMLElement ? active : null;
    },
    /** Use as `onCloseAutoFocus`. */
    restoreOpener: (event: Event) => {
      event.preventDefault();
      openerRef.current?.focus();
    },
  };
}
