// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SideNav } from './SideNav';

const pathname = vi.hoisted(() => ({ current: '/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => pathname.current,
}));

function renderAt(path: string) {
  pathname.current = path;
  return render(<SideNav />);
}

function activeLabels(): string[] {
  return screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')
    .map((link) => link.textContent ?? '');
}

describe('SideNav', () => {
  afterEach(() => {
    cleanup();
  });

  it('should show three tabs with an icon and a label', () => {
    renderAt('/');
    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(['Trang Chủ', 'Lịch Sử', 'Hồ Sơ']);
    for (const link of links) expect(link.querySelector('svg')).not.toBeNull();
  });

  it('should link the tabs to Home, /history and the own profile', () => {
    renderAt('/');
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(['/', '/history', '/profile']);
  });

  it('should have no tab for the Leaderboard', () => {
    renderAt('/');
    expect(screen.queryByRole('link', { name: /Xếp Hạng/ })).toBeNull();
  });

  it.each([
    ['/', 'Trang Chủ'],
    ['/history', 'Lịch Sử'],
    ['/profile', 'Hồ Sơ'],
  ])('should highlight only the tab of %s', (path, label) => {
    renderAt(path);
    expect(activeLabels()).toEqual([label]);
  });

  it.each(['/analysis', '/leaderboard', '/play'])('should highlight no tab on %s', (path) => {
    renderAt(path);
    expect(activeLabels()).toEqual([]);
  });

  it('should highlight Hồ Sơ on a page below the profile', () => {
    renderAt('/profile/settings');
    expect(activeLabels()).toEqual(['Hồ Sơ']);
  });

  it('should not highlight Lịch Sử on a page with the same start', () => {
    renderAt('/historyx');
    expect(activeLabels()).toEqual([]);
  });

  it('should be a 64 px rail that shows from 1024 px', () => {
    renderAt('/');
    const rail = screen.getByRole('navigation', { name: 'Menu cá nhân' });
    expect(rail.className).toContain('w-16');
    expect(rail.className).toContain('hidden');
    expect(rail.className).toContain('lg:block');
    expect(within(rail).getAllByRole('listitem')).toHaveLength(3);
  });

  it('should show the open page in bold gold and the other tabs in the muted color', () => {
    renderAt('/history');
    const [home, history] = screen.getAllByRole('link');
    expect(history?.className).toContain('text-gold');
    expect(history?.className).toContain('font-bold');
    expect(home?.className).toContain('text-navy-muted');
    expect(home?.className).not.toContain('text-gold');
  });

  it('should use the navy background and the border color of the design', () => {
    renderAt('/');
    const rail = screen.getByRole('navigation', { name: 'Menu cá nhân' });
    expect(rail.className).toContain('bg-navy');
    expect(rail.className).toContain('border-navy-border');
  });
});
