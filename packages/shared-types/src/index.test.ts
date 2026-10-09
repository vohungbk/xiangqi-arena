import { describe, expect, it } from 'vitest';
import {
  calculateEloDelta,
  getDailyPairMultiplier,
  getKFactor,
  isEarlyAbandon,
  isValidRoomCode,
  parseFen,
  RatingKFactor,
  ROOM,
  Side,
  START_FEN,
  toFen,
  USERNAME,
} from './index';

describe('getKFactor', () => {
  it('should return provisional K for the first 10 games', () => {
    expect(getKFactor(1500, 9)).toBe(RatingKFactor.PROVISIONAL);
  });
  it('should return normal K below 2400 after provisional period', () => {
    expect(getKFactor(2399, 10)).toBe(RatingKFactor.NORMAL);
  });
  it('should return master K at 2400 and above', () => {
    expect(getKFactor(2400, 50)).toBe(RatingKFactor.MASTER);
  });
});

describe('calculateEloDelta', () => {
  it('should give +20 for a provisional win between equal players', () => {
    expect(calculateEloDelta({ rating: 1500, gamesPlayed: 0, score: 1, opponentRating: 1500 })).toBe(
      20,
    );
  });
  it('should not drop a rating below the floor of 100', () => {
    expect(calculateEloDelta({ rating: 110, gamesPlayed: 0, score: 0, opponentRating: 110 })).toBe(
      -10,
    );
  });
  it('should return 0 when the daily pair multiplier is 0', () => {
    expect(
      calculateEloDelta({
        rating: 1500,
        gamesPlayed: 20,
        score: 1,
        opponentRating: 1500,
        pairMultiplier: 0,
      }),
    ).toBe(0);
  });
});

describe('getDailyPairMultiplier', () => {
  it('should return 1 for games 1-3, 0.5 for 4-5 and 0 from 6', () => {
    expect([1, 3, 4, 5, 6, 9].map(getDailyPairMultiplier)).toEqual([1, 1, 0.5, 0.5, 0, 0]);
  });
});

describe('isEarlyAbandon', () => {
  it('should be true below 5 plies per side and false at 5', () => {
    expect(isEarlyAbandon(4)).toBe(true);
    expect(isEarlyAbandon(5)).toBe(false);
  });
});

describe('FEN utils', () => {
  it('should round-trip the start position', () => {
    expect(toFen(parseFen(START_FEN))).toBe(START_FEN);
  });
  it('should parse side to move', () => {
    expect(parseFen(START_FEN).turn).toBe(Side.RED);
  });
  it('should throw when the FEN has the wrong number of rows', () => {
    expect(() => parseFen('9/9 w')).toThrow();
  });
});

describe('room codes and usernames', () => {
  it('should reject codes containing 0, O, 1 or I', () => {
    for (const bad of ['ABCDE0', 'ABCDEO', 'ABCDE1', 'ABCDEI']) {
      expect(isValidRoomCode(bad)).toBe(false);
    }
  });
  it('should accept a valid 6-char code', () => {
    expect(isValidRoomCode('ABC234')).toBe(true);
    expect(ROOM.CODE_ALPHABET).toHaveLength(32);
  });
  it('should reject non-ASCII and too-short usernames', () => {
    expect(USERNAME.PATTERN.test('ab')).toBe(false);
    expect(USERNAME.PATTERN.test('tướng')).toBe(false);
    expect(USERNAME.PATTERN.test('red_king')).toBe(true);
  });
});
