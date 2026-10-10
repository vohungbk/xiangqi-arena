import { describe, expect, it } from 'vitest';
import { HOME_HREF, isActiveItem, NAV_ITEMS } from './nav-items';

describe('NAV_ITEMS', () => {
  it('should list the three links in the order of the top menu', () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      'Đấu Online',
      'Chơi Với Máy',
      'Bảng Xếp Hạng',
    ]);
  });

  it('should give each link its own page', () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).not.toContain(HOME_HREF);
  });
});

describe('isActiveItem', () => {
  it('should be active on the page of the item', () => {
    expect(isActiveItem('/leaderboard', '/leaderboard')).toBe(true);
  });

  it('should be active on a page below the item', () => {
    expect(isActiveItem('/leaderboard/weekly', '/leaderboard')).toBe(true);
  });

  it('should not be active on a page with the same start but another name', () => {
    expect(isActiveItem('/leaderboardx', '/leaderboard')).toBe(false);
    expect(isActiveItem('/play-again', '/play')).toBe(false);
  });

  it('should not be active on Home', () => {
    expect(isActiveItem('/', '/play')).toBe(false);
  });
});
