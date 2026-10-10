import { History, Home, User } from 'lucide-react';
import { HISTORY_HREF, HOME_HREF, PROFILE_HREF, type NavItem } from './nav-items';

/**
 * Tabs of the Side Nav on Desktop (ENG-F07 R8). There is no tab for the Leaderboard,
 * because the top menu has [Bảng Xếp Hạng].
 */
export const SIDE_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Trang Chủ', href: HOME_HREF, icon: Home },
  { label: 'Lịch Sử', href: HISTORY_HREF, icon: History },
  { label: 'Hồ Sơ', href: PROFILE_HREF, icon: User },
];
