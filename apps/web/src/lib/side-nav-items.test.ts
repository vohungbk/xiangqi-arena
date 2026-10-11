import { describe, expect, it } from 'vitest';
import { isMemberOnlyHref, SIDE_NAV_ITEMS } from './side-nav-items';

describe('SIDE_NAV_ITEMS', () => {
  it('should list Trang Chủ, Lịch Sử and Hồ Sơ in this order', () => {
    expect(SIDE_NAV_ITEMS.map((item) => item.label)).toEqual(['Trang Chủ', 'Lịch Sử', 'Hồ Sơ']);
  });

  it('should open Home, /history and the own profile', () => {
    expect(SIDE_NAV_ITEMS.map((item) => item.href)).toEqual(['/', '/history', '/profile']);
  });

  it('should have no tab for the Leaderboard', () => {
    const text = SIDE_NAV_ITEMS.map((item) => `${item.label} ${item.href}`).join(' ');
    expect(text).not.toMatch(/Xếp Hạng|leaderboard/i);
  });
});

describe('isMemberOnlyHref', () => {
  it('should lock Lịch Sử and Hồ Sơ for a Guest', () => {
    expect(isMemberOnlyHref('/history')).toBe(true);
    expect(isMemberOnlyHref('/profile')).toBe(true);
  });

  it('should leave Home open for a Guest', () => {
    expect(isMemberOnlyHref('/')).toBe(false);
  });
});
