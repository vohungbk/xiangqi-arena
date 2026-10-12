'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatHeaderRating, pickHeaderRating } from '@/lib/header-rating';
import type { HeaderUser } from '@/lib/header-user';
import { getInitials } from '@/lib/initials';
import { PROFILE_HREF, SETTINGS_HREF } from '@/lib/nav-items';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  user: HeaderUser;
  onLogout: () => void;
  /** Avatar only. The Username and the Rating move into the drawer (ENG-F07 R10). */
  compact?: boolean;
}

const ITEM_CLASS = 'min-h-11 cursor-pointer px-4 text-sm';

/**
 * Menu of the logged-in player (ENG-F07 R6): Hồ Sơ, Cài Đặt and Đăng Xuất. It is a shadcn/ui
 * DropdownMenu (Radix), so the arrow keys, Home and End move through the items, Esc closes it
 * and the focus returns to the Avatar.
 */
export function UserMenu({ user, onLogout, compact = false }: UserMenuProps) {
  const rating = pickHeaderRating(user.ratings);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={compact ? `Menu người dùng: ${user.username}` : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg px-2 py-1 outline-none hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring',
            compact && 'min-h-[44px] min-w-[44px] justify-center',
          )}
        >
          <Avatar aria-hidden="true" className="size-9 border border-gold after:hidden">
            <AvatarFallback className="bg-transparent text-sm font-semibold text-gold">
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <>
              <span className="flex min-w-0 flex-col text-left">
                <span className="max-w-40 truncate text-sm font-semibold">{user.username}</span>
                <span className="whitespace-nowrap text-xs text-fg-muted">
                  {formatHeaderRating(rating)}
                  {rating.provisional ? ' · Đang Đánh Giá' : ''}
                </span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-fg-muted" aria-hidden="true" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label="Menu người dùng" className="w-48">
        <DropdownMenuItem asChild className={ITEM_CLASS}>
          <Link href={PROFILE_HREF}>Hồ Sơ</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={ITEM_CLASS}>
          <Link href={SETTINGS_HREF}>Cài Đặt</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={ITEM_CLASS} onSelect={onLogout}>
          Đăng Xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
