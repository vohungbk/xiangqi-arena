'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActiveItem, NAV_ITEMS } from '@/lib/nav-items';

export function TopMenu() {
  const pathname = usePathname();

  return (
    <nav aria-label="Menu chính">
      <ul className="flex items-center gap-6">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActiveItem(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'border-gold text-gold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-100'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
