'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActiveItem } from '@/lib/nav-items';
import { SIDE_NAV_ITEMS } from '@/lib/side-nav-items';

/**
 * Narrow rail on the left, 64 px wide, for screens of 1024 px and wider (ENG-F07 R8, R22).
 * Below 1024 px the Bottom Nav takes its place (another story).
 */
export function SideNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Menu cá nhân"
      className="hidden w-16 shrink-0 border-r border-line bg-app py-4 lg:block"
    >
      <ul className="flex flex-col gap-1">
        {SIDE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActiveItem(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-1 py-3 text-[11px] transition-colors ${
                  active ? 'font-bold text-gold' : 'font-medium text-fg-muted hover:text-fg'
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
  );
}
