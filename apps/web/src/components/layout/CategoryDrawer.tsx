'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { trapTab } from '@/lib/focus-trap';
import { isActiveItem, LOGIN_HREF, NAV_ITEMS } from '@/lib/nav-items';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';
import { LanguageButton } from './LanguageButton';

/** From this width the full header shows and the drawer has no place (ENG-F07 R22). */
const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * Drawer "Danh mục" of the compact shell (ENG-F07 R11): the three menu links, the language
 * button and, for a Guest, [Đăng Nhập / Đăng Ký]. The look follows the shared menu (ASM01).
 * The open state lives in the shell store, so a rotation keeps it (E12).
 */
export function CategoryDrawer() {
  const open = useShellStore((state) => state.drawerOpen);
  const closeDrawer = useShellStore((state) => state.closeDrawer);
  const user = useSessionStore((state) => state.user);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const panel = panelRef.current;
    panel?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
      else if (event.key === 'Tab' && panel) trapTab(event, panel);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open, closeDrawer]);

  // Any navigation closes the drawer: its own links, the Back button or a redirect.
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    closeDrawer();
  }, [pathname, closeDrawer]);

  // From 1024 px on CSS hides the drawer. Close it too, so it is not open after a resize back.
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia(DESKTOP_QUERY);
    if (query.matches) {
      closeDrawer();
      return;
    }
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeDrawer();
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [open, closeDrawer]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        data-testid="drawer-backdrop"
        aria-hidden="true"
        onClick={closeDrawer}
        className="absolute inset-0 bg-app opacity-70"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Danh mục"
        tabIndex={-1}
        className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col gap-4 overflow-y-auto border-r border-line bg-app p-4 focus:outline-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Danh mục</span>
          <button
            type="button"
            aria-label="Đóng danh mục"
            onClick={closeDrawer}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg hover:bg-surface"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Danh mục">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActiveItem(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeDrawer}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-surface text-gold'
                        : 'text-fg-muted hover:bg-surface hover:text-fg'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-line pt-4">
          <LanguageButton />
        </div>
        {user ? null : (
          <Link
            href={LOGIN_HREF}
            onClick={closeDrawer}
            className="flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold"
          >
            Đăng Nhập / Đăng Ký
          </Link>
        )}
      </div>
    </div>
  );
}
