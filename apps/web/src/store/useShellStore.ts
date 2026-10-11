import { create } from 'zustand';

interface ShellState {
  /**
   * True while a live game is on screen (online, AI or local, ENG-F07 R14).
   * The game screens set it. The shell hides the banner and the navigation then.
   */
  inGame: boolean;
  setInGame: (inGame: boolean) => void;
  /** Rounded number of players online, or null when unknown (ENG-F07 R3). S06 adds the writer. */
  onlinePlayers: number | null;
  /** Drawer "Danh mục" of the compact shell (ENG-F07 R11). The drawer itself is story S11, which adds the setters it needs. */
  drawerOpen: boolean;
  toggleDrawer: () => void;
}

export const useShellStore = create<ShellState>((set) => ({
  inGame: false,
  setInGame: (inGame) => set({ inGame }),
  onlinePlayers: null,
  drawerOpen: false,
  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
}));
