// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { HeaderUser } from '@/lib/header-user';
import { makeHeaderUser } from '@/lib/header-user.fixture';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';
import { BannerSlot } from './BannerSlot';

const BANNER_TEXT = 'Xác thực email ngay để mở khóa chế độ Đấu Xếp Hạng (Ranked).';
const unverified = makeHeaderUser({ emailVerified: false });

function setState(user: HeaderUser | null, inGame = false) {
  useSessionStore.setState({ user });
  useShellStore.setState({ inGame });
}

describe('BannerSlot', () => {
  beforeEach(() => {
    setState(null);
  });

  afterEach(() => {
    cleanup();
  });

  it('should show the reminder when the email is not verified', () => {
    setState(unverified);
    render(<BannerSlot />);
    expect(screen.getByRole('status').textContent).toBe(BANNER_TEXT);
  });

  it('should span the full width', () => {
    setState(unverified);
    render(<BannerSlot />);
    expect(screen.getByRole('status').className).toContain('w-full');
  });

  it.each([
    ['the email is verified', makeHeaderUser({ emailVerified: true }), false],
    ['the player is a Guest', null, false],
    ['a live game is on screen', unverified, true],
  ])('should show no banner and keep no height when %s', (_label, user, inGame) => {
    setState(user, inGame);
    const { container } = render(<BannerSlot />);
    expect(container.innerHTML).toBe('');
  });

  it('should bring the banner back when the game screen closes', () => {
    setState(unverified, true);
    render(<BannerSlot />);
    expect(screen.queryByRole('status')).toBeNull();
    act(() => useShellStore.getState().setInGame(false));
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('should remove the banner after the email is verified', () => {
    setState(unverified);
    render(<BannerSlot />);
    expect(screen.getByRole('status')).toBeTruthy();
    act(() => useSessionStore.getState().setUser({ ...unverified, emailVerified: true }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('should not show a variant label such as Tone=Info', () => {
    setState(unverified);
    render(<BannerSlot />);
    expect(screen.getByRole('status').textContent).not.toMatch(/Tone\s*=/i);
  });
});
