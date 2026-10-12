import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { NAV_ITEMS } from './nav-items';
import {
  findRemovedLabels,
  findRemovedPaths,
  REMOVED_PATH_NAMES,
  REMOVED_STREAK_PATTERN,
  REMOVED_VIEWER_PATTERN,
} from './removed-items.fixture';
import { SIDE_NAV_ITEMS } from './side-nav-items';

const appDir = fileURLToPath(new URL('../app', import.meta.url));

/** Route segments under `app/`. A route group `(name)` is not a segment of the URL. */
function routeSegments(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const isGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
      const own = isGroup ? [] : [entry.name];
      return [...own, ...routeSegments(`${dir}/${entry.name}`)];
    });
}

describe('removed items', () => {
  it('should not list a removed item in the top menu', () => {
    expect(findRemovedLabels(NAV_ITEMS.map((item) => item.label).join(' '))).toEqual([]);
  });

  it('should not list a removed item in the Side Nav and the Bottom Nav', () => {
    expect(findRemovedLabels(SIDE_NAV_ITEMS.map((item) => item.label).join(' '))).toEqual([]);
  });

  it('should not link the old paths of the removed items', () => {
    const hrefs = [...NAV_ITEMS, ...SIDE_NAV_ITEMS].map((item) => item.href);
    expect(findRemovedPaths(hrefs)).toEqual([]);
  });

  it('should have no page for the old paths so they return the not-found page', () => {
    const segments = routeSegments(appDir);
    for (const name of REMOVED_PATH_NAMES) expect(segments).not.toContain(name);
    // A dynamic segment such as [section] would answer the old paths too.
    expect(segments.filter((segment) => segment.startsWith('['))).toEqual([]);
  });

  it('should find a removed label whatever its case', () => {
    expect(findRemovedLabels('GIẢI ĐỐ và luyện tập')).toEqual(['Luyện tập', 'Giải Đố']);
    expect(findRemovedLabels('Đấu Online')).toEqual([]);
  });

  it('should find a link to a removed path but not a path that only starts the same', () => {
    expect(findRemovedPaths(['/community', '/practice/daily'])).toEqual([
      '/community',
      '/practice/daily',
    ]);
    expect(findRemovedPaths(['/play', '/communityx'])).toEqual([]);
  });

  it('should not flag a reviewer or a plain 7-day text as a removed item', () => {
    expect(REMOVED_VIEWER_PATTERN.test('Reviewer')).toBe(false);
    expect(REMOVED_VIEWER_PATTERN.test('Đang xem: 12')).toBe(true);
    expect(REMOVED_STREAK_PATTERN.test('Hết hạn sau 7 ngày')).toBe(false);
    expect(REMOVED_STREAK_PATTERN.test('Chuỗi 7 ngày')).toBe(true);
  });
});
