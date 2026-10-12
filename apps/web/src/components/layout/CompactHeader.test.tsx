// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeHeaderUser } from '@/lib/header-user.fixture';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';
import { CompactHeader } from './CompactHeader';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

function login(overrides: Parameters<typeof makeHeaderUser>[0] = {}) {
  useSessionStore.setState({ user: makeHeaderUser(overrides) });
}

describe('CompactHeader', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null });
    useShellStore.setState({ onlinePlayers: null, drawerOpen: false });
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  describe('breakpoint', () => {
    it('should hide the compact header from 1024 px on', () => {
      const { container } = render(<CompactHeader />);
      expect((container.firstElementChild as HTMLElement).className).toContain('lg:hidden');
    });
  });

  describe('logged-in player', () => {
    it('should show the logo, the online badge, the bell and the Avatar', () => {
      login();
      useShellStore.setState({ onlinePlayers: 1240 });
      render(<CompactHeader />);
      expect(screen.getByRole('link', { name: 'Xiangqi Arena - Trang Chủ' })).toBeTruthy();
      expect(screen.getByText('1,240')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Thông báo' })).toBeTruthy();
      expect(screen.getByText('MA')).toBeTruthy();
    });

    it('should link the logo to Home', () => {
      login();
      render(<CompactHeader />);
      expect(
        screen.getByRole('link', { name: 'Xiangqi Arena - Trang Chủ' }).getAttribute('href'),
      ).toBe('/');
    });

    it('should not show the language button or the Username text', () => {
      login();
      render(<CompactHeader />);
      expect(screen.queryByText('Tiếng Việt')).toBeNull();
      expect(screen.queryByText('minh_anh')).toBeNull();
      expect(screen.queryByText(/Rating/)).toBeNull();
    });

    it('should keep the Username as the accessible name of the Avatar', () => {
      login();
      render(<CompactHeader />);
      expect(screen.getByRole('button', { name: 'Menu người dùng: minh_anh' })).toBeTruthy();
    });

    it('should open the user dropdown when the Avatar is clicked', () => {
      login();
      render(<CompactHeader />);
      // Radix opens a menu on the pointerdown of the main button.
      fireEvent.pointerDown(screen.getByRole('button', { name: /Menu người dùng: minh_anh/ }), {
        button: 0,
        ctrlKey: false,
      });
      expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
        'Hồ Sơ',
        'Cài Đặt',
        'Đăng Xuất',
      ]);
    });

    it('should show the unread mark on the bell when the inbox has unread items', () => {
      login({ unreadCount: 3 });
      render(<CompactHeader />);
      expect(screen.getByTestId('unread-mark')).toBeTruthy();
    });

    it('should hide the online badge when the number cannot be loaded', () => {
      login();
      render(<CompactHeader />);
      expect(screen.queryByRole('status')).toBeNull();
    });
  });

  describe('Guest', () => {
    it('should show Đăng Nhập / Đăng Ký instead of the bell and the Avatar', () => {
      render(<CompactHeader />);
      expect(screen.getByRole('link', { name: 'Đăng Nhập / Đăng Ký' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Thông báo' })).toBeNull();
      expect(screen.queryByText('MA')).toBeNull();
    });
  });

  describe('button Danh mục', () => {
    it('should show the button under the header for a player and for a Guest', () => {
      const { container, unmount } = render(<CompactHeader />);
      const header = container.querySelector('header') as HTMLElement;
      const button = screen.getByRole('button', { name: 'Danh mục' });
      expect(header.contains(button)).toBe(false);
      expect(
        header.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      unmount();

      login();
      render(<CompactHeader />);
      expect(screen.getByRole('button', { name: 'Danh mục' })).toBeTruthy();
    });

    it('should toggle the drawer state when the button is clicked', () => {
      render(<CompactHeader />);
      const button = screen.getByRole('button', { name: 'Danh mục' });
      expect(button.getAttribute('aria-expanded')).toBe('false');
      fireEvent.click(button);
      expect(useShellStore.getState().drawerOpen).toBe(true);
      expect(button.getAttribute('aria-expanded')).toBe('true');
      fireEvent.click(button);
      expect(useShellStore.getState().drawerOpen).toBe(false);
    });

    it('should open the drawer with the menu links when the button is clicked', () => {
      render(<CompactHeader />);
      expect(screen.queryByRole('dialog')).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Danh mục' }));
      const drawer = screen.getByRole('dialog', { name: 'Danh mục' });
      expect(drawer.querySelectorAll('nav a')).toHaveLength(3);
    });
  });
});
