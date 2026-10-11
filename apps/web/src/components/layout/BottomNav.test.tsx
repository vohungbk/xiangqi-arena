// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeHeaderUser } from '@/lib/header-user.fixture';
import { SIDE_NAV_ITEMS } from '@/lib/side-nav-items';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';
import { BottomNav } from './BottomNav';

const pathname = vi.hoisted(() => ({ current: '/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => pathname.current,
}));

function renderAt(path: string) {
  pathname.current = path;
  return render(<BottomNav />);
}

/** Every tab, whether it is a link or, for a Guest, a button. */
function tabs(): HTMLElement[] {
  const nav = screen.getByRole('navigation', { name: 'Thanh điều hướng dưới' });
  return [...nav.querySelectorAll<HTMLElement>('li > a, li > button')];
}

function tab(name: string): HTMLElement {
  const found = tabs().find((element) => element.textContent === name);
  if (!found) throw new Error(`No tab named ${name}`);
  return found;
}

function activeLabels(): string[] {
  return tabs()
    .filter((element) => element.getAttribute('aria-current') === 'page')
    .map((element) => element.textContent ?? '');
}

describe('BottomNav', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null });
    useShellStore.setState({ inGame: false, loginModalOpen: false });
  });

  afterEach(() => {
    cleanup();
  });

  describe('layout', () => {
    it('should show three tabs with an icon and a label', () => {
      renderAt('/');
      expect(tabs().map((element) => element.textContent)).toEqual([
        'Trang Chủ',
        'Lịch Sử',
        'Hồ Sơ',
      ]);
      for (const element of tabs()) expect(element.querySelector('svg')).not.toBeNull();
    });

    it('should be fixed at the bottom and hidden from 1024 px on', () => {
      renderAt('/');
      const nav = screen.getByRole('navigation', { name: 'Thanh điều hướng dưới' });
      expect(nav.className).toContain('fixed');
      expect(nav.className).toContain('bottom-0');
      expect(nav.className).toContain('lg:hidden');
    });

    it('should be 56 px high', () => {
      renderAt('/');
      expect(screen.getByRole('navigation').className).toContain('h-14');
    });

    it('should keep every tab at least 44 x 44 px', () => {
      renderAt('/');
      for (const element of tabs()) {
        expect(element.className).toContain('min-h-[44px]');
        expect(element.className).toContain('min-w-[44px]');
      }
    });

    it('should keep a spacer as high as the bar so it does not cover the page end', () => {
      const { container } = renderAt('/');
      const spacer = container.firstElementChild as HTMLElement;
      expect(spacer.getAttribute('aria-hidden')).toBe('true');
      expect(spacer.className).toContain('h-14');
      expect(spacer.className).toContain('lg:hidden');
    });
  });

  describe('logged-in player', () => {
    beforeEach(() => {
      useSessionStore.setState({ user: makeHeaderUser() });
    });

    it('should open the same pages as the Side Nav', () => {
      renderAt('/');
      const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
      expect(hrefs).toEqual(SIDE_NAV_ITEMS.map((item) => item.href));
    });

    it('should open the page and not the login modal when a tab is tapped', () => {
      renderAt('/');
      const click = fireEvent.click(screen.getByRole('link', { name: 'Lịch Sử' }));
      expect(click).toBe(true);
      expect(useShellStore.getState().loginModalOpen).toBe(false);
    });
  });

  describe('current page', () => {
    it('should highlight the tab of the current page', () => {
      renderAt('/history');
      expect(activeLabels()).toEqual(['Lịch Sử']);
    });

    it('should highlight Hồ Sơ on a page below the profile', () => {
      renderAt('/profile/settings');
      expect(activeLabels()).toEqual(['Hồ Sơ']);
    });

    it('should highlight Trang Chủ only on Home', () => {
      renderAt('/');
      expect(activeLabels()).toEqual(['Trang Chủ']);
    });

    it('should highlight no tab on a page that no tab opens', () => {
      renderAt('/leaderboard');
      expect(activeLabels()).toEqual([]);
    });
  });

  describe('Guest', () => {
    it.each(['Lịch Sử', 'Hồ Sơ'])(
      'should show %s as a button without a link target and open the login modal',
      (name) => {
        renderAt('/');
        const element = tab(name);
        expect(element.tagName).toBe('BUTTON');
        expect(element.getAttribute('href')).toBeNull();
        fireEvent.click(element);
        expect(useShellStore.getState().loginModalOpen).toBe(true);
      },
    );

    it('should let a Guest open Trang Chủ as a link without the login modal', () => {
      renderAt('/history');
      const home = tab('Trang Chủ');
      expect(home.tagName).toBe('A');
      expect(home.getAttribute('href')).toBe('/');
      fireEvent.click(home);
      expect(useShellStore.getState().loginModalOpen).toBe(false);
    });

    it('should still highlight a member-only tab on its own page', () => {
      renderAt('/history');
      expect(activeLabels()).toEqual(['Lịch Sử']);
    });
  });

  describe('live game', () => {
    it('should render nothing while a live game is on screen', () => {
      useShellStore.setState({ inGame: true });
      const { container } = renderAt('/');
      expect(container.innerHTML).toBe('');
    });

    it('should show again when the game ends', () => {
      useShellStore.setState({ inGame: true });
      renderAt('/');
      expect(screen.queryByRole('navigation')).toBeNull();
      act(() => useShellStore.setState({ inGame: false }));
      expect(screen.getByRole('navigation', { name: 'Thanh điều hướng dưới' })).toBeTruthy();
    });
  });
});
