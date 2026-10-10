import { create } from 'zustand';
import type { HeaderUser } from '@/lib/header-user';

interface SessionState {
  /** Logged-in player, or null for a Guest. Filled by the login flow (USR-F01). */
  user: HeaderUser | null;
  setUser: (user: HeaderUser) => void;
  clearUser: () => void;
}

/** Display data only. Tokens never go in this store. */
export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
