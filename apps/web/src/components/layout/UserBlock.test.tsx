// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    function open() {
      login();
      render(<UserBlock />);
      fireEvent.click(screen.getByRole('button', { name: /minh_anh/ }));
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

    it('should close when the player clicks outside', () => {
      open();
      fireEvent.mouseDown(document.body);
      expect(screen.queryByRole('menu')).toBeNull();
    });

    it('should stay open when the player clicks inside the menu', () => {
      open();
      fireEvent.mouseDown(screen.getByRole('menu'));
      expect(screen.getByRole('menu')).toBeTruthy();
    });

    it('should close and return the focus to the button when Esc is pressed', () => {
      open();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('menu')).toBeNull();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /minh_anh/ }));
    });

    it('should close when the trigger is clicked again', () => {
      open();
      fireEvent.click(screen.getByRole('button', { name: /minh_anh/ }));
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });
});
