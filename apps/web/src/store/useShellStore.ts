import { create } from 'zustand';

/** A small message over the page, for example a notification in a live game (ENG-F07 R13, E11). */
export interface Toast {
  id: number;
  message: string;
}

/** The toasts on screen at once. A new one pushes the oldest out. */
export const MAX_TOASTS = 3;

let nextToastId = 1;

interface ShellState {
  /**
   * True while a live game is on screen (online, AI or local, ENG-F07 R14).
   * The game screens set it through `useLiveGame`. The shell hides the banner, the header and
   * the navigation, and shows the in-game bar (R13). Pages such as the analysis, the replay,
   * the setup and the search never set it, so they keep the full shell (R14).
   */
  inGame: boolean;
  /** Number of live game screens that are mounted. `inGame` is true while it is above 0. */
  liveGameRefs: number;
  /** One more live game screen is on. Prefer `useLiveGame` over calling this. */
  enterLiveGame: () => void;
  /** One live game screen is gone. At 0 the full shell comes back and the leave modal closes. */
  leaveLiveGame: () => void;
  /** Forces the state. It also resets the count. Prefer `useLiveGame`. */
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
  /**
   * Leave modal that the logo and [Rời Đi] of the in-game bar open (ENG-F07 Nav-6). The shell
   * only keeps the state. The modal and the leave itself belong to the game flow.
   * It opens only in a live game, so a click at the moment the game ends does not open it (E5),
   * and it closes when the game ends (E8).
   */
  leaveModalOpen: boolean;
  openLeaveModal: () => void;
  closeLeaveModal: () => void;
  toasts: Toast[];
  /** Shows a toast. Plain text only. The notification source calls it. */
  pushToast: (message: string) => void;
  dismissToast: (id: number) => void;
}

export const useShellStore = create<ShellState>((set) => ({
  inGame: false,
  liveGameRefs: 0,
  // A drawer left open must not come back open when the game ends.
  enterLiveGame: () =>
    set((state) => ({ inGame: true, drawerOpen: false, liveGameRefs: state.liveGameRefs + 1 })),
  leaveLiveGame: () =>
    set((state) => {
      const liveGameRefs = Math.max(0, state.liveGameRefs - 1);
      return liveGameRefs > 0
        ? { liveGameRefs }
        : { inGame: false, liveGameRefs: 0, leaveModalOpen: false };
    }),
  setInGame: (inGame) =>
    set((state) =>
      inGame
        ? { inGame: true, drawerOpen: false, liveGameRefs: Math.max(1, state.liveGameRefs) }
        : { inGame: false, liveGameRefs: 0, leaveModalOpen: false },
    ),
  onlinePlayers: null,
  drawerOpen: false,
  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
  closeDrawer: () => set({ drawerOpen: false }),
  loginModalOpen: false,
  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
  leaveModalOpen: false,
  openLeaveModal: () => set((state) => (state.inGame ? { leaveModalOpen: true } : {})),
  closeLeaveModal: () => set({ leaveModalOpen: false }),
  toasts: [],
  pushToast: (message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: nextToastId++, message }].slice(-MAX_TOASTS),
    })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
