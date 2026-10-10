import { create } from 'zustand';

interface ShellState {
  /**
   * True while a live game is on screen (online, AI or local, ENG-F07 R14).
   * The game screens set it. The shell hides the banner and the navigation then.
   */
  inGame: boolean;
  setInGame: (inGame: boolean) => void;
}

export const useShellStore = create<ShellState>((set) => ({
  inGame: false,
  setInGame: (inGame) => set({ inGame }),
}));
