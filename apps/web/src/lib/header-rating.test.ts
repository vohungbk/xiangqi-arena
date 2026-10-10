import { describe, expect, it } from 'vitest';
import { GameMode, RATING } from '@xiangqi/shared-types';
import { formatHeaderRating, pickHeaderRating } from './header-rating';

describe('pickHeaderRating', () => {
  it('should pick the mode with the most games', () => {
    const line = pickHeaderRating([
      { mode: GameMode.BLITZ, rating: 1620, gamesPlayed: 30 },
      { mode: GameMode.RAPID, rating: 1500, gamesPlayed: 12 },
      { mode: GameMode.CLASSIC, rating: 1450, gamesPlayed: 3 },
    ]);
    expect(line).toEqual({ mode: GameMode.BLITZ, rating: 1620, provisional: false });
  });

  it('should pick Rapid when the top modes have the same number of games', () => {
    const line = pickHeaderRating([
      { mode: GameMode.BLITZ, rating: 1620, gamesPlayed: 20 },
      { mode: GameMode.RAPID, rating: 1510, gamesPlayed: 20 },
    ]);
    expect(line.mode).toBe(GameMode.RAPID);
    expect(line.rating).toBe(1510);
  });

  it('should pick Rapid with the base rating when no game was played', () => {
    expect(pickHeaderRating([])).toEqual({
      mode: GameMode.RAPID,
      rating: RATING.BASE,
      provisional: true,
    });
  });

  it('should mark a mode with fewer than the official games as provisional', () => {
    const below = pickHeaderRating([
      { mode: GameMode.CLASSIC, rating: 1480, gamesPlayed: RATING.PROVISIONAL_GAMES - 1 },
    ]);
    const exact = pickHeaderRating([
      { mode: GameMode.CLASSIC, rating: 1480, gamesPlayed: RATING.PROVISIONAL_GAMES },
    ]);
    expect(below.provisional).toBe(true);
    expect(exact.provisional).toBe(false);
  });
});

describe('formatHeaderRating', () => {
  it('should write the word Rating, the mode name and the number', () => {
    expect(formatHeaderRating({ mode: GameMode.RAPID, rating: 1500, provisional: false })).toBe(
      'Rating Rapid: 1500',
    );
  });
});
