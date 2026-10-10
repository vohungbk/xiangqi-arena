import { beforeEach, describe, expect, it } from 'vitest';
import { GameMode, Side, START_FEN } from '@xiangqi/shared-types';
import { useGameStore } from './useGameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should start with the standard position and no game', () => {
    const state = useGameStore.getState();
    expect(state.gameId).toBeNull();
    expect(state.fen).toBe(START_FEN);
    expect(state.side).toBe(Side.RED);
  });

  it('should merge a patch into the state', () => {
    useGameStore.getState().setGame({ gameId: 'g1', mode: GameMode.BLITZ, moves: ['h2e2'] });
    const state = useGameStore.getState();
    expect(state.gameId).toBe('g1');
    expect(state.moves).toEqual(['h2e2']);
    expect(state.fen).toBe(START_FEN);
  });

  it('should return to the initial state after reset', () => {
    useGameStore.getState().setGame({ gameId: 'g1', redTimeMs: 5000 });
    useGameStore.getState().reset();
    expect(useGameStore.getState().gameId).toBeNull();
    expect(useGameStore.getState().redTimeMs).toBe(0);
  });
});
