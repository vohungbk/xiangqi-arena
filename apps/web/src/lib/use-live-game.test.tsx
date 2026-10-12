// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useShellStore } from '@/store/useShellStore';
import { LiveGameKind } from './live-game-kind';
import { useLiveGame } from './use-live-game';

const shell = () => useShellStore.getState();

describe('useLiveGame', () => {
  beforeEach(() => {
    useShellStore.setState({
      inGame: false,
      liveGameRefs: 0,
      leaveModalOpen: false,
      liveGameKind: null,
      leaveHandler: null,
    });
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

  it('should tell the shell the kind of the game', () => {
    renderHook(() => useLiveGame(true, { kind: LiveGameKind.AI }));
    expect(shell().liveGameKind).toBe(LiveGameKind.AI);
  });

  it('should run the latest onLeave once when the leave is confirmed', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ onLeave }) => useLiveGame(true, { kind: LiveGameKind.LOCAL, onLeave }),
      { initialProps: { onLeave: first } },
    );
    rerender({ onLeave: second });
    act(() => {
      shell().openLeaveModal();
      shell().confirmLeave();
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('should not enter the game again when only the callback changes', () => {
    const { rerender } = renderHook(
      ({ onLeave }) => useLiveGame(true, { kind: LiveGameKind.AI, onLeave }),
      { initialProps: { onLeave: () => undefined } },
    );
    rerender({ onLeave: () => undefined });
    expect(shell().liveGameRefs).toBe(1);
  });

  it('should forget the kind when the screen goes away', () => {
    const { unmount } = renderHook(() => useLiveGame(true, { kind: LiveGameKind.AI }));
    unmount();
    expect(shell().liveGameKind).toBeNull();
  });

  it('should leave a page that does not use the hook with the full shell', () => {
    renderHook(() => undefined);
    expect(shell().inGame).toBe(false);
  });
});
