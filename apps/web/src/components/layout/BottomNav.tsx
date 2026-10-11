'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActiveItem } from '@/lib/nav-items';
import { isMemberOnlyHref, SIDE_NAV_ITEMS } from '@/lib/side-nav-items';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';

const TAB_CLASS =
  'flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors';

/**
 * Bottom bar below 1024 px with Trang Chủ, Lịch Sử and Hồ Sơ (ENG-F07 R12, R22). It takes
 * the place of the Side Nav and uses the same tabs. It is hidden in a live game (R13).
 * For a Guest a member-only tab is a button that opens the login modal, not a link (R19).
 */
export function BottomNav() {
  const pathname = usePathname();
  const inGame = useShellStore((state) => state.inGame);
  const openLoginModal = useShellStore((state) => state.openLoginModal);
  const isGuest = useSessionStore((state) => state.user === null);

  if (inGame) return null;

  return (
    <>
      {/* Keeps the last content of a page above the fixed bar (same height as the bar). */}
      <div aria-hidden="true" className="h-14 shrink-0 lg:hidden" />
      <nav
        aria-label="Thanh điều hướng dưới"
        className="fixed inset-x-0 bottom-0 z-40 h-14 border-t border-line bg-app lg:hidden"
      >
        <ul className="flex h-full">
          {SIDE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActiveItem(pathname, href);
            const tabClass = `${TAB_CLASS} ${
              active ? 'font-bold text-gold' : 'font-medium text-fg-muted hover:text-fg'
            }`;
            const content = (
              <>
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </>
            );

            return (
              <li key={href} className="flex flex-1">
                {isGuest && isMemberOnlyHref(href) ? (
                  <button
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={openLoginModal}
                    className={tabClass}
                  >
                    {content}
                  </button>
                ) : (
                  <Link href={href} aria-current={active ? 'page' : undefined} className={tabClass}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
