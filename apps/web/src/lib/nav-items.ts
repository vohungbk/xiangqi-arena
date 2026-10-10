import type { LucideIcon } from 'lucide-react';
import { Bot, Swords, Trophy } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Home page. The logo links here. */
export const HOME_HREF = '/';

/** Top menu of the app shell (ENG-F07 R2). The order is the order on the screen. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Đấu Online', href: '/play', icon: Swords },
  { label: 'Chơi Với Máy', href: '/ai', icon: Bot },
  { label: 'Bảng Xếp Hạng', href: '/leaderboard', icon: Trophy },
];

/**
 * A menu item is active on its own page and on the pages below it.
 * A page that no item opens (Home, profile) has no active item (ENG-F07 R24).
 */
export function isActiveItem(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
