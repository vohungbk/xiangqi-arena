import { GameMode } from '@xiangqi/shared-types';
import type { HeaderUser } from './header-user';

/** A logged-in player for component tests. Pass the fields a test cares about. */
export function makeHeaderUser(overrides: Partial<HeaderUser> = {}): HeaderUser {
  return {
    username: 'minh_anh',
    ratings: [{ mode: GameMode.RAPID, rating: 1500, gamesPlayed: 12 }],
    unreadCount: 0,
    emailVerified: true,
    ...overrides,
  };
}
