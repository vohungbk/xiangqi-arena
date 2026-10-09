import { create } from 'zustand';
import { START_FEN, Side, type GameMode } from '@xiangqi/shared-types';

interface GameState {
  gameId: string | null;
  mode: GameMode | null;
  side: Side;
  fen: string;
  moves: string[];
  redTimeMs: number;
  blackTimeMs: number;
  setGame: (patch: Partial<Omit<GameState, 'setGame' | 'reset'>>) => void;
  reset: () => void;
}

const initial = {
  gameId: null,
  mode: null,
  side: Side.RED,
  fen: START_FEN,
  moves: [] as string[],
  redTimeMs: 0,
  blackTimeMs: 0,
};

export const useGameStore = create<GameState>((set) => ({
  ...initial,
  setGame: (patch) => set(patch),
  reset: () => set(initial),
}));
