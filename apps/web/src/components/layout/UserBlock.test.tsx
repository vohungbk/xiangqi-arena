// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GameMode } from '@xiangqi/shared-types';
import type { HeaderUser } from '@/lib/header-user';
import { makeHeaderUser } from '@/lib/header-user.fixture';
import { useSessionStore } from '@/store/useSessionStore';
import { UserBlock } from './UserBlock';

const player = makeHeaderUser();

function login(user: Partial<HeaderUser> = {}) {
  useSessionStore.setState({ user: { ...player, ...user } });
}

describe('UserBlock', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null });
  });

  afterEach(() => {
    cleanup();
  });

  describe('user block content', () => {
    it('should show nothing for a Guest', () => {
      const { container } = render(<UserBlock />);
      expect(container.innerHTML).toBe('');
    });

    it('should show the bell, the Avatar, the Username and the Rating line', () => {
      login();
      render(<UserBlock />);
      expect(screen.getByRole('button', { name: 'Thông báo' })).toBeTruthy();
      expect(screen.getByText('MA')).toBeTruthy();
      expect(screen.getByText('minh_anh')).toBeTruthy();
      expect(screen.getByText('Rating Rapid: 1500')).toBeTruthy();
    });

    it('should show the mark Đang Đánh Giá for a mode with fewer than 10 games', () => {
      login({ ratings: [{ mode: GameMode.RAPID, rating: 1500, gamesPlayed: 4 }] });
      render(<UserBlock />);
      expect(screen.getByText(/Đang Đánh Giá/)).toBeTruthy();
    });

    it('should keep a 20 character Username inside a truncated box', () => {
      login({ username: 'a_very_long_username' });
      render(<UserBlock />);
      expect(screen.getByText('a_very_long_username').className).toContain('truncate');
    });
  });

  describe('bell', () => {
    it('should show no mark when the inbox has no unread item', () => {
      login({ unreadCount: 0 });
      render(<UserBlock />);
      expect(screen.queryByTestId('unread-mark')).toBeNull();
    });

    it.each([1, 12])('should show a mark when the inbox has %i unread items', (count) => {
      login({ unreadCount: count });
      render(<UserBlock />);
      expect(screen.getByTestId('unread-mark')).toBeTruthy();
      expect(screen.getByRole('button', { name: `Thông báo, ${count} chưa đọc` })).toBeTruthy();
    });
  });

  describe('dropdown', () => {
    /** Radix opens a menu on `pointerdown` of the main button, not on `click`. */
    function press(element: Element) {
      fireEvent.pointerDown(element, { button: 0, ctrlKey: false });
    }

    function open() {
      login();
      render(<UserBlock />);
      press(screen.getByRole('button', { name: /minh_anh/ }));
    }

    it('should be closed at first', () => {
      login();
      render(<UserBlock />);
      expect(screen.queryByRole('menu')).toBeNull();
      expect(screen.getByRole('button', { name: /minh_anh/ }).getAttribute('aria-expanded')).toBe(
        'false',
      );
    });

    it('should open with Hồ Sơ, Cài Đặt and Đăng Xuất when the user block is clicked', () => {
      open();
      const items = screen.getAllByRole('menuitem').map((item) => item.textContent);
      expect(items).toEqual(['Hồ Sơ', 'Cài Đặt', 'Đăng Xuất']);
    });

    it('should link Hồ Sơ to the own profile and Cài Đặt to /profile/settings', () => {
      open();
      expect(screen.getByRole('menuitem', { name: 'Hồ Sơ' }).getAttribute('href')).toBe('/profile');
      expect(screen.getByRole('menuitem', { name: 'Cài Đặt' }).getAttribute('href')).toBe(
        '/profile/settings',
      );
    });

    it('should log the player out when Đăng Xuất is clicked', () => {
      open();
      fireEvent.click(screen.getByRole('menuitem', { name: 'Đăng Xuất' }));
      expect(useSessionStore.getState().user).toBeNull();
    });

    it('should close when the player clicks outside', async () => {
      open();
      // Radix starts to listen for an outside press one tick after the menu opens.
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      press(document.body);
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });

    it('should stay open when the player presses inside the menu', () => {
      open();
      press(screen.getByRole('menu'));
      expect(screen.getByRole('menu')).toBeTruthy();
    });

    it('should close and return the focus to the button when Esc is pressed', async () => {
      open();
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /minh_anh/ }));
    });

    it('should close when the trigger is pressed again', async () => {
      open();
      // While the menu is open Radix hides the rest of the page from the accessibility tree.
      press(screen.getByRole('button', { name: /minh_anh/, hidden: true }));
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });

    it('should move through the items with the arrow keys', () => {
      open();
      const menu = screen.getByRole('menu');
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      const items = screen.getAllByRole('menuitem');
      expect(items).toContain(document.activeElement);
    });

    it('should open with the keyboard from the Avatar', () => {
      login();
      render(<UserBlock />);
      fireEvent.keyDown(screen.getByRole('button', { name: /minh_anh/ }), { key: 'Enter' });
      expect(screen.getByRole('menu')).toBeTruthy();
    });
  });
});
