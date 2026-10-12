// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeHeaderUser } from '@/lib/header-user.fixture';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';
import { CategoryDrawer } from './CategoryDrawer';

const mocks = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname }));

type MediaListener = (event: MediaQueryListEvent) => void;

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<MediaListener>();
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation(() => ({
      matches,
      addEventListener: (_: string, listener: MediaListener) => listeners.add(listener),
      removeEventListener: (_: string, listener: MediaListener) => listeners.delete(listener),
    })),
  );
  return {
    emit: (next: boolean) =>
      listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent)),
  };
}

function openDrawer() {
  useShellStore.setState({ drawerOpen: true });
}

describe('CategoryDrawer', () => {
  beforeEach(() => {
    mocks.pathname = '/';
    useSessionStore.setState({ user: null });
    useShellStore.setState({ drawerOpen: false });
    stubMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  describe('visibility', () => {
    it('should render nothing while the drawer is closed', () => {
      render(<CategoryDrawer />);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('should render the drawer when the store opens it', () => {
      openDrawer();
      render(<CategoryDrawer />);
      expect(screen.getByRole('dialog', { name: 'Danh mục' })).toBeTruthy();
    });

    it('should be hidden from 1024 px on by CSS', () => {
      openDrawer();
      render(<CategoryDrawer />);
      expect(screen.getByRole('dialog').className).toContain('lg:hidden');
    });
  });

  describe('content', () => {
    it('should hold the three links and the language button for a logged-in player', () => {
      useSessionStore.setState({ user: makeHeaderUser() });
      openDrawer();
      render(<CategoryDrawer />);
      const links = screen.getAllByRole('link').map((link) => link.textContent);
      expect(links).toEqual(['Đấu Online', 'Chơi Với Máy', 'Bảng Xếp Hạng']);
      expect(screen.getByRole('button', { name: /Tiếng Việt/ })).toBeTruthy();
    });

    it('should show Đăng Nhập / Đăng Ký for a Guest', () => {
      openDrawer();
      render(<CategoryDrawer />);
      expect(screen.getByRole('link', { name: 'Đăng Nhập / Đăng Ký' }).getAttribute('href')).toBe(
        '/login',
      );
    });

    it('should not show Đăng Nhập / Đăng Ký for a logged-in player', () => {
      useSessionStore.setState({ user: makeHeaderUser() });
      openDrawer();
      render(<CategoryDrawer />);
      expect(screen.queryByRole('link', { name: 'Đăng Nhập / Đăng Ký' })).toBeNull();
    });

    it('should link to the same pages as the top menu', () => {
      openDrawer();
      render(<CategoryDrawer />);
      const hrefs = ['Đấu Online', 'Chơi Với Máy', 'Bảng Xếp Hạng'].map((name) =>
        screen.getByRole('link', { name }).getAttribute('href'),
      );
      expect(hrefs).toEqual(['/play', '/ai', '/leaderboard']);
    });
  });

  describe('closing', () => {
    it('should close when a link is chosen', () => {
      openDrawer();
      render(<CategoryDrawer />);
      fireEvent.click(screen.getByRole('link', { name: 'Bảng Xếp Hạng' }));
      expect(useShellStore.getState().drawerOpen).toBe(false);
    });

    it('should show a dimmed area behind the panel that closes it on a press', () => {
      // jsdom does not run the outside press of Radix, so only the area is checked here. The
      // press itself is checked in a real browser (see the PR).
      openDrawer();
      render(<CategoryDrawer />);
      expect(document.querySelector('[data-slot="sheet-overlay"]')).not.toBeNull();
    });

    it('should close when Esc is pressed', () => {
      openDrawer();
      render(<CategoryDrawer />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(useShellStore.getState().drawerOpen).toBe(false);
    });

    it('should stay open when another key is pressed', () => {
      openDrawer();
      render(<CategoryDrawer />);
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(useShellStore.getState().drawerOpen).toBe(true);
    });

    it('should return the focus to the element that opened it', async () => {
      const opener = document.createElement('button');
      document.body.appendChild(opener);
      opener.focus();
      openDrawer();
      render(<CategoryDrawer />);
      expect(document.activeElement).not.toBe(opener);
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => expect(document.activeElement).toBe(opener));
      opener.remove();
    });

    it('should close when the close button is clicked', () => {
      openDrawer();
      render(<CategoryDrawer />);
      fireEvent.click(screen.getByRole('button', { name: 'Đóng danh mục' }));
      expect(useShellStore.getState().drawerOpen).toBe(false);
    });
  });

  describe('modal behavior', () => {
    it('should close when the page changes by another route than its links', () => {
      openDrawer();
      const { rerender } = render(<CategoryDrawer />);
      expect(useShellStore.getState().drawerOpen).toBe(true);
      mocks.pathname = '/play';
      rerender(<CategoryDrawer />);
      expect(useShellStore.getState().drawerOpen).toBe(false);
    });

    it('should keep the Tab focus inside the panel', () => {
      openDrawer();
      render(<CategoryDrawer />);
      // The close button is the last control of the panel, the first link is the first.
      const close = screen.getByRole('button', { name: 'Đóng danh mục' });
      close.focus();
      fireEvent.keyDown(close, { key: 'Tab' });
      expect(document.activeElement).toBe(screen.getAllByRole('link')[0]);
    });

    it('should wrap Shift+Tab from the first control to the last one', () => {
      openDrawer();
      render(<CategoryDrawer />);
      const first = screen.getAllByRole('link')[0] as HTMLElement;
      first.focus();
      fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Đóng danh mục' }));
    });

    it('should lock the page scroll while open and restore it on close', async () => {
      openDrawer();
      render(<CategoryDrawer />);
      expect(document.body.hasAttribute('data-scroll-locked')).toBe(true);
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => expect(document.body.hasAttribute('data-scroll-locked')).toBe(false));
    });
  });

  describe('rotation and resize', () => {
    it('should stay open when the viewport stays below 1024 px (rotation)', () => {
      const media = stubMatchMedia(false);
      openDrawer();
      render(<CategoryDrawer />);
      media.emit(false);
      expect(useShellStore.getState().drawerOpen).toBe(true);
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('should close when the viewport grows to 1024 px', () => {
      const media = stubMatchMedia(false);
      openDrawer();
      render(<CategoryDrawer />);
      media.emit(true);
      expect(useShellStore.getState().drawerOpen).toBe(false);
    });

    it('should close at once when it opens on a viewport of 1024 px or more', () => {
      stubMatchMedia(true);
      openDrawer();
      render(<CategoryDrawer />);
      expect(useShellStore.getState().drawerOpen).toBe(false);
    });
  });

  describe('current page', () => {
    it('should highlight the link of the current page', () => {
      mocks.pathname = '/leaderboard';
      openDrawer();
      render(<CategoryDrawer />);
      expect(screen.getByRole('link', { name: 'Bảng Xếp Hạng' }).getAttribute('aria-current')).toBe(
        'page',
      );
      expect(
        screen.getByRole('link', { name: 'Đấu Online' }).getAttribute('aria-current'),
      ).toBeNull();
    });

    it('should highlight the link for a page below it', () => {
      mocks.pathname = '/play/room/ABC123';
      openDrawer();
      render(<CategoryDrawer />);
      expect(screen.getByRole('link', { name: 'Đấu Online' }).getAttribute('aria-current')).toBe(
        'page',
      );
    });

    it('should highlight no link on Home', () => {
      openDrawer();
      render(<CategoryDrawer />);
      expect(document.querySelector('[aria-current="page"]')).toBeNull();
    });
  });
});
