import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LiveGameKind } from '@/lib/live-game-kind';
import { useShellStore } from './useShellStore';

const shell = () => useShellStore.getState();

describe('useShellStore live game scope', () => {
  beforeEach(() => {
    useShellStore.setState({
      inGame: false,
      liveGameRefs: 0,
      liveGameKind: null,
      leaveHandler: null,
      leaveModalOpen: false,
      drawerOpen: false,
    });
  });

  describe('leave modal', () => {
    it('should open the leave modal in a live game', () => {
      shell().setInGame(true);
      shell().openLeaveModal();
      expect(shell().leaveModalOpen).toBe(true);
    });

    it('should not open the leave modal when no live game is on screen', () => {
      shell().openLeaveModal();
      expect(shell().leaveModalOpen).toBe(false);
    });

    it('should not open the leave modal when a click comes at the moment the game ends', () => {
      shell().setInGame(true);
      shell().setInGame(false);
      shell().openLeaveModal();
      expect(shell().leaveModalOpen).toBe(false);
    });

    it('should close the leave modal when the game ends', () => {
      shell().setInGame(true);
      shell().openLeaveModal();
      shell().setInGame(false);
      expect(shell().leaveModalOpen).toBe(false);
    });

    it('should close the leave modal when the last live game screen goes away', () => {
      shell().enterLiveGame();
      shell().openLeaveModal();
      shell().leaveLiveGame();
      expect(shell().leaveModalOpen).toBe(false);
    });
  });

  describe('confirmed leave', () => {
    it('should run the leave handler once and close the modal', () => {
      const onLeave = vi.fn();
      shell().enterLiveGame({ kind: LiveGameKind.AI, onLeave });
      shell().openLeaveModal();
      expect(shell().confirmLeave()).toBe(true);
      expect(onLeave).toHaveBeenCalledTimes(1);
      expect(shell().leaveModalOpen).toBe(false);
    });

    it('should do nothing when the modal is not open', () => {
      const onLeave = vi.fn();
      shell().enterLiveGame({ kind: LiveGameKind.AI, onLeave });
      expect(shell().confirmLeave()).toBe(false);
      expect(onLeave).not.toHaveBeenCalled();
    });

    it('should do nothing on a second confirm', () => {
      const onLeave = vi.fn();
      shell().enterLiveGame({ kind: LiveGameKind.LOCAL, onLeave });
      shell().openLeaveModal();
      shell().confirmLeave();
      expect(shell().confirmLeave()).toBe(false);
      expect(onLeave).toHaveBeenCalledTimes(1);
    });

    it('should confirm when the game has no leave handler', () => {
      shell().enterLiveGame({ kind: LiveGameKind.LOCAL });
      shell().openLeaveModal();
      expect(shell().confirmLeave()).toBe(true);
    });
  });

  describe('kind and handler of the live game', () => {
    it('should keep the kind while a live game screen is on', () => {
      shell().enterLiveGame({ kind: LiveGameKind.LOCAL });
      expect(shell().liveGameKind).toBe(LiveGameKind.LOCAL);
    });

    it('should forget the kind and the handler when the last screen goes away', () => {
      shell().enterLiveGame({ kind: LiveGameKind.AI, onLeave: () => undefined });
      shell().leaveLiveGame();
      expect(shell().liveGameKind).toBeNull();
      expect(shell().leaveHandler).toBeNull();
    });

    it('should forget the kind and the handler when setInGame forces the shell back', () => {
      shell().enterLiveGame({ kind: LiveGameKind.AI, onLeave: () => undefined });
      shell().setInGame(false);
      expect(shell().liveGameKind).toBeNull();
      expect(shell().leaveHandler).toBeNull();
    });

    it('should keep the kind of the other screen when one of two goes away', () => {
      shell().enterLiveGame({ kind: LiveGameKind.AI });
      shell().enterLiveGame();
      shell().leaveLiveGame();
      expect(shell().liveGameKind).toBe(LiveGameKind.AI);
    });
  });

  describe('live game screens', () => {
    it('should be in a game while one live game screen is on', () => {
      shell().enterLiveGame();
      expect(shell().inGame).toBe(true);
      expect(shell().liveGameRefs).toBe(1);
    });

    it('should stay in the game when one of two live game screens goes away', () => {
      shell().enterLiveGame();
      shell().enterLiveGame();
      shell().leaveLiveGame();
      expect(shell().inGame).toBe(true);
      expect(shell().liveGameRefs).toBe(1);
    });

    it('should bring the full shell back when the last live game screen goes away', () => {
      shell().enterLiveGame();
      shell().enterLiveGame();
      shell().leaveLiveGame();
      shell().leaveLiveGame();
      expect(shell().inGame).toBe(false);
    });

    it('should not count below zero when a screen leaves twice', () => {
      shell().enterLiveGame();
      shell().leaveLiveGame();
      shell().leaveLiveGame();
      expect(shell().liveGameRefs).toBe(0);
      shell().enterLiveGame();
      expect(shell().inGame).toBe(true);
    });

    it('should close an open drawer when a live game starts', () => {
      useShellStore.setState({ drawerOpen: true });
      shell().enterLiveGame();
      expect(shell().drawerOpen).toBe(false);
    });

    it('should reset the count when setInGame forces the shell back', () => {
      shell().enterLiveGame();
      shell().enterLiveGame();
      shell().setInGame(false);
      expect(shell().inGame).toBe(false);
      expect(shell().liveGameRefs).toBe(0);
    });
  });
});
