'use client';

import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * Toasts of the app (ENG-F07 R13, E11). The app has one dark theme, so the theme is fixed and
 * the colors come from the app tokens. The toasts sit under the in-game bar (offset), so they
 * never cover [Rời Đi], and Sonner keeps at most three on screen.
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      offset={{ top: 80, right: 16 }}
      mobileOffset={{ top: 80, right: 16, left: 16 }}
      visibleToasts={3}
      duration={4000}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--color-surface)',
          '--normal-text': 'var(--color-fg)',
          '--normal-border': 'var(--color-line)',
          '--border-radius': '0.5rem',
        } as CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
