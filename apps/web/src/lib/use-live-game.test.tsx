// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useShellStore } from '@/store/useShellStore';
import { useLiveGame } from './use-live-game';

const shell = () => useShellStore.getState();

describe('useLiveGame', () => {
  beforeEach(() => {
    useShellStore.setState({ inGame: false, liveGameRefs: 0, leaveModalOpen: false });
  });

  afterEach(() => {
    cleanup();
  });

  it('should put the shell in a live game while the screen is on', () => {
    renderHook(() => useLiveGame());
    expect(shell().inGame).toBe(true);
  });

  it('should bring the full shell back when the screen goes away', () => {
    const { unmount } = renderHook(() => useLiveGame());
    unmount();
    expect(shell().inGame).toBe(false);
  });

  it('should bring the full shell back when the game ends', () => {
    const { rerender } = renderHook(({ live }) => useLiveGame(live), {
      initialProps: { live: true },
    });
    expect(shell().inGame).toBe(true);
    rerender({ live: false });
    expect(shell().inGame).toBe(false);
  });

  it('should close the leave modal when the opponent resigns or the clock ends', () => {
    const { rerender } = renderHook(({ live }) => useLiveGame(live), {
      initialProps: { live: true },
    });
    act(() => shell().openLeaveModal());
    expect(shell().leaveModalOpen).toBe(true);
    rerender({ live: false });
    expect(shell().leaveModalOpen).toBe(false);
  });

  it('should not enter a live game when the game is already over', () => {
    renderHook(() => useLiveGame(false));
    expect(shell().inGame).toBe(false);
  });

  it('should keep the shell in a game while another live screen is still on', () => {
    const first = renderHook(() => useLiveGame());
    renderHook(() => useLiveGame());
    first.unmount();
    expect(shell().inGame).toBe(true);
  });

  it('should leave a page that does not use the hook with the full shell', () => {
    renderHook(() => undefined);
    expect(shell().inGame).toBe(false);
  });
});
