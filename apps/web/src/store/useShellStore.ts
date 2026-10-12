import { create } from 'zustand';
import type { LiveGameKind } from '@/lib/live-game-kind';

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
  /** The kind of the live game that is on screen, or null (ENG-F07 R17). */
  liveGameKind: LiveGameKind | null;
  /** Drops the unfinished game of the screen. Runs once on a confirmed leave (R17). */
  leaveHandler: (() => void) | null;
  /** One more live game screen is on. Prefer `useLiveGame` over calling this. */
  enterLiveGame: (info?: { kind?: LiveGameKind; onLeave?: () => void }) => void;
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
   * Leave modal that the logo and [Rời Đi] of the in-game bar open (ENG-F07 Nav-6). The
   * `LeaveModal` component shows it for an AI or local game (R17). The online game has its own
   * story. It opens only in a live game, so a click at the moment the game ends does not open
   * it (E5), and it closes when the game ends (E8).
   */
  leaveModalOpen: boolean;
  openLeaveModal: () => void;
  closeLeaveModal: () => void;
  /**
   * The player confirms the leave. It closes the modal, runs the leave handler once and
   * returns true. It returns false when the modal is not open, so a second click does nothing.
   */
  confirmLeave: () => boolean;
  toasts: Toast[];
  /** Shows a toast. Plain text only. The notification source calls it. */
  pushToast: (message: string) => void;
  dismissToast: (id: number) => void;
}

export const useShellStore = create<ShellState>((set, get) => ({
  inGame: false,
  liveGameRefs: 0,
  liveGameKind: null,
  leaveHandler: null,
  // A drawer left open must not come back open when the game ends.
  enterLiveGame: (info) =>
    set((state) => ({
      inGame: true,
      drawerOpen: false,
      liveGameRefs: state.liveGameRefs + 1,
      // The newest live game screen wins.
      liveGameKind: info?.kind ?? state.liveGameKind,
      leaveHandler: info?.onLeave ?? state.leaveHandler,
    })),
  leaveLiveGame: () =>
    set((state) => {
      const liveGameRefs = Math.max(0, state.liveGameRefs - 1);
      return liveGameRefs > 0
        ? { liveGameRefs }
        : {
            inGame: false,
            liveGameRefs: 0,
            leaveModalOpen: false,
            liveGameKind: null,
            leaveHandler: null,
          };
    }),
  setInGame: (inGame) =>
    set((state) =>
      inGame
        ? { inGame: true, drawerOpen: false, liveGameRefs: Math.max(1, state.liveGameRefs) }
        : {
            inGame: false,
            liveGameRefs: 0,
            leaveModalOpen: false,
            liveGameKind: null,
            leaveHandler: null,
          },
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
  confirmLeave: () => {
    const { leaveModalOpen, leaveHandler } = get();
    if (!leaveModalOpen) return false;
    set({ leaveModalOpen: false, leaveHandler: null });
    try {
      leaveHandler?.();
    } catch (error) {
      // The player still leaves. The failed cleanup of the screen is logged, not hidden.
      console.error('The leave handler of the live game failed', error);
    }
    return true;
  },
  toasts: [],
  pushToast: (message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: nextToastId++, message }].slice(-MAX_TOASTS),
    })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
