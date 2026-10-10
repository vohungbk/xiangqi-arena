import type { GameMode } from '@xiangqi/shared-types';

export interface HeaderRating {
  mode: GameMode;
  rating: number;
  gamesPlayed: number;
}

/** What the header needs to know about the logged-in player. */
export interface HeaderUser {
  username: string;
  ratings: HeaderRating[];
  /** Unread items in the notification inbox (owned by USR-F03). */
  unreadCount: number;
}
