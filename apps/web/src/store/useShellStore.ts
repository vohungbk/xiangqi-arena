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
  /** Drawer "Danh mục" of the compact shell (ENG-F07 R11). */
  drawerOpen: boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  /**
   * Login modal a Guest gets from a member-only tab (ENG-F07 R19). The shell only keeps the
   * state. The modal itself is owned by USR-F01.
   */
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useShellStore = create<ShellState>((set) => ({
  inGame: false,
  setInGame: (inGame) => set({ inGame }),
  onlinePlayers: null,
  drawerOpen: false,
  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
  closeDrawer: () => set({ drawerOpen: false }),
  loginModalOpen: false,
  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
}));
