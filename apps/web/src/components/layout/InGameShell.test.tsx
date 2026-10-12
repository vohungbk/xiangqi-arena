// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeHeaderUser } from '@/lib/header-user.fixture';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';
import { AppHeader } from './AppHeader';
import { BannerSlot } from './BannerSlot';
import { BottomNav } from './BottomNav';
import { CompactHeader } from './CompactHeader';
import { InGameBar } from './InGameBar';
import { SideNav } from './SideNav';

vi.mock('next/navigation', () => ({ usePathname: () => '/play' }));

/** The whole shell, as `app/layout.tsx` renders it. */
function Shell() {
  return (
    <>
      <AppHeader />
      <CompactHeader />
      <InGameBar />
      <BannerSlot />
      <SideNav />
      <BottomNav />
    </>
  );
}

function setInGame(inGame: boolean) {
  act(() => useShellStore.getState().setInGame(inGame));
}

describe('the shell in a live game', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: makeHeaderUser({ unreadCount: 2, emailVerified: false }) });
    useShellStore.setState({ inGame: false, drawerOpen: false, onlinePlayers: 1240 });
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

  it('should show the menu, the Side Nav, the Bottom Nav and the header controls outside a game', () => {
    render(<Shell />);
    expect(screen.getAllByRole('link', { name: 'Đấu Online' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('navigation', { name: 'Menu cá nhân' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Thanh điều hướng dưới' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Danh mục' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /Thông báo/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('1,240').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Rời Đi' })).toBeNull();
  });

  it('should show only the logo and Rời Đi at the top in a live game', () => {
    setInGame(true);
    render(<Shell />);
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Xiangqi Arena - Rời ván' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Rời Đi' })).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('should hide the top menu, the Side Nav, the Bottom Nav and the drawer button', () => {
    setInGame(true);
    render(<Shell />);
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Đấu Online' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Danh mục' })).toBeNull();
  });

  it('should hide the online badge, the language button, the user block and the bell', () => {
    setInGame(true);
    render(<Shell />);
    expect(screen.queryByText('1,240')).toBeNull();
    expect(screen.queryByText('Tiếng Việt')).toBeNull();
    expect(screen.queryByRole('button', { name: /Menu người dùng/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Thông báo/ })).toBeNull();
    expect(screen.queryByTestId('unread-mark')).toBeNull();
  });

  it('should hide the email banner in a live game', () => {
    render(<Shell />);
    expect(screen.getByText(/Xác thực email ngay/)).toBeTruthy();
    setInGame(true);
    expect(screen.queryByText(/Xác thực email ngay/)).toBeNull();
  });

  it('should bring the shell back when the game ends', () => {
    setInGame(true);
    render(<Shell />);
    setInGame(false);
    expect(screen.getByRole('navigation', { name: 'Menu cá nhân' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Rời Đi' })).toBeNull();
  });

  it('should keep the drawer closed after a game that started while it was open', () => {
    render(<Shell />);
    act(() => useShellStore.getState().toggleDrawer());
    expect(useShellStore.getState().drawerOpen).toBe(true);
    setInGame(true);
    setInGame(false);
    expect(useShellStore.getState().drawerOpen).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
