import { beforeEach, describe, expect, it } from 'vitest';
import { useShellStore } from './useShellStore';

const shell = () => useShellStore.getState();

describe('useShellStore live game scope', () => {
  beforeEach(() => {
    useShellStore.setState({
      inGame: false,
      liveGameRefs: 0,
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
