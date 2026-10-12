'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { isActiveItem, LOGIN_HREF, NAV_ITEMS } from '@/lib/nav-items';
import { useRestoreFocus } from '@/lib/use-restore-focus';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';
import { LanguageButton } from './LanguageButton';

/** From this width the full header shows and the drawer has no place (ENG-F07 R22). */
const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * Drawer "Danh mục" of the compact shell (ENG-F07 R11): the three menu links, the language
 * button and, for a Guest, [Đăng Nhập / Đăng Ký]. The look follows the shared menu (ASM01).
 * The open state lives in the shell store, so a rotation keeps it (E12).
 *
 * It is a shadcn/ui Sheet (Radix Dialog): Esc, a click on the dimmed area, the close button and
 * the focus trap, the scroll lock and the return of the focus come from Radix.
 */
export function CategoryDrawer() {
  const open = useShellStore((state) => state.drawerOpen);
  const closeDrawer = useShellStore((state) => state.closeDrawer);
  const user = useSessionStore((state) => state.user);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const { rememberOpener, restoreOpener } = useRestoreFocus();

  // Any navigation closes the drawer: its own links, the Back button or a redirect.
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    closeDrawer();
  }, [pathname, closeDrawer]);

  // From 1024 px on the drawer has no place. Close it, so it is not open after a resize back.
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

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) closeDrawer();
      }}
    >
      <SheetContent
        ref={panelRef}
        side="left"
        closeLabel="Đóng danh mục"
        // Radix would focus the first control that is not a link, which is the language button,
        // and its tooltip would open at once. Start on the panel itself, as the drawer did.
        onOpenAutoFocus={(event) => {
          rememberOpener();
          event.preventDefault();
          panelRef.current?.focus();
        }}
        onCloseAutoFocus={restoreOpener}
        className="gap-4 border-line p-4 data-[side=left]:w-[280px] data-[side=left]:max-w-[85vw] data-[side=left]:sm:max-w-[280px] lg:hidden"
      >
        <SheetHeader className="p-0">
          <SheetTitle>Danh mục</SheetTitle>
          <SheetDescription className="sr-only">
            Các trang chính và ngôn ngữ của ứng dụng
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Danh mục">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActiveItem(pathname, href);
              return (
                <li key={href}>
                  <Button
                    asChild
                    variant="ghost"
                    className={`w-full justify-start gap-3 px-3 ${
                      active ? 'bg-surface text-gold' : 'text-fg-muted hover:text-fg'
                    }`}
                  >
                    <Link
                      href={href}
                      onClick={closeDrawer}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      {label}
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-line pt-4">
          <LanguageButton />
        </div>
        {user ? null : (
          <Button asChild className="font-semibold">
            <Link href={LOGIN_HREF} onClick={closeDrawer}>
              Đăng Nhập / Đăng Ký
            </Link>
          </Button>
        )}
      </SheetContent>
    </Sheet>
  );
}
