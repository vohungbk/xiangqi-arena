// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GameMode } from '@xiangqi/shared-types';
import type { HeaderUser } from '@/lib/header-user';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';
import { BannerSlot, EMAIL_BANNER_TEXT } from './BannerSlot';

const player: HeaderUser = {
  username: 'minh_anh',
  ratings: [{ mode: GameMode.RAPID, rating: 1500, gamesPlayed: 12 }],
  unreadCount: 0,
  emailVerified: false,
};

describe('BannerSlot', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null });
    useShellStore.setState({ inGame: false });
  });

  afterEach(() => {
    cleanup();
  });

  it('should show the reminder when the email is not verified', () => {
    useSessionStore.setState({ user: player });
    render(<BannerSlot />);
    expect(screen.getByText(EMAIL_BANNER_TEXT)).toBeTruthy();
    expect(EMAIL_BANNER_TEXT).toBe('Xác thực email ngay để mở khóa chế độ Đấu Xếp Hạng (Ranked).');
  });

  it('should span the full width', () => {
    useSessionStore.setState({ user: player });
    render(<BannerSlot />);
    expect(screen.getByRole('status').className).toContain('w-full');
  });

  it('should show no banner and keep no height when the email is verified', () => {
    useSessionStore.setState({ user: { ...player, emailVerified: true } });
    const { container } = render(<BannerSlot />);
    expect(container.innerHTML).toBe('');
  });

  it('should show no banner for a Guest', () => {
    const { container } = render(<BannerSlot />);
    expect(container.innerHTML).toBe('');
  });

  it('should show no banner in a live game even when the email is not verified', () => {
    useSessionStore.setState({ user: player });
    useShellStore.setState({ inGame: true });
    const { container } = render(<BannerSlot />);
    expect(container.innerHTML).toBe('');
  });

  it('should bring the banner back when the game screen closes', () => {
    useSessionStore.setState({ user: player });
    useShellStore.setState({ inGame: true });
    render(<BannerSlot />);
    expect(screen.queryByRole('status')).toBeNull();
    act(() => useShellStore.getState().setInGame(false));
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('should remove the banner after the email is verified', () => {
    useSessionStore.setState({ user: player });
    render(<BannerSlot />);
    expect(screen.getByRole('status')).toBeTruthy();
    act(() => useSessionStore.getState().setUser({ ...player, emailVerified: true }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('should not show a variant label such as Tone=Info', () => {
    useSessionStore.setState({ user: player });
    const { container } = render(<BannerSlot />);
    expect(container.textContent).not.toMatch(/Tone\s*=/i);
    expect(container.textContent).toBe(EMAIL_BANNER_TEXT);
  });
});
