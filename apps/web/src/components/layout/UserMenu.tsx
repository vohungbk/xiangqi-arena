'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { formatHeaderRating, pickHeaderRating } from '@/lib/header-rating';
import type { HeaderUser } from '@/lib/header-user';
import { getInitials } from '@/lib/initials';
import { PROFILE_HREF, SETTINGS_HREF } from '@/lib/nav-items';

interface UserMenuProps {
  user: HeaderUser;
  onLogout: () => void;
}

const ITEM_CLASS =
  'block w-full px-4 py-2 text-left text-sm text-fg hover:bg-surface-inset focus:bg-surface-inset focus:outline-none';

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const rating = pickHeaderRating(user.ratings);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent | MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-surface"
      >
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-semibold text-gold"
        >
          {getInitials(user.username)}
        </span>
        <span className="flex min-w-0 flex-col text-left">
          <span className="max-w-[10rem] truncate text-sm font-semibold">{user.username}</span>
          <span className="whitespace-nowrap text-xs text-fg-muted">
            {formatHeaderRating(rating)}
            {rating.provisional ? ' · Đang Đánh Giá' : ''}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-fg-muted" aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Menu người dùng"
          className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg"
        >
          <Link
            href={PROFILE_HREF}
            role="menuitem"
            className={ITEM_CLASS}
            onClick={() => setOpen(false)}
          >
            Hồ Sơ
          </Link>
          <Link
            href={SETTINGS_HREF}
            role="menuitem"
            className={ITEM_CLASS}
            onClick={() => setOpen(false)}
          >
            Cài Đặt
          </Link>
          <button
            type="button"
            role="menuitem"
            className={ITEM_CLASS}
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            Đăng Xuất
          </button>
        </div>
      ) : null}
    </div>
  );
}
