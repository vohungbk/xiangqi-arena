import { describe, expect, it } from 'vitest';
import {
  allPoints,
  BoardError,
  BoardErrorCode,
  PALACE,
  RIVER,
  Side,
  type Point,
} from '@xiangqi/shared-types';
import { getZone, isAcrossRiver, isInPalace, palaceBounds, riverSideOf } from './zones';

const OUTSIDE: Point[] = [
  { x: -1, y: 0 },
  { x: 9, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 10 },
  { x: 1.5, y: 2 },
];

function codeOf(run: () => unknown): BoardErrorCode | undefined {
  try {
    run();
  } catch (error) {
    if (error instanceof BoardError) return error.code;
    throw error;
  }
  return undefined;
}

describe('palaceBounds', () => {
  it('should cover x 3 to 5 and y 0 to 2 for the Black Palace', () => {
    expect(palaceBounds(Side.BLACK)).toEqual({ minX: 3, maxX: 5, minY: 0, maxY: 2 });
  });

  it('should cover x 3 to 5 and y 7 to 9 for the Red Palace', () => {
    expect(palaceBounds(Side.RED)).toEqual({ minX: 3, maxX: 5, minY: 7, maxY: 9 });
  });
});

describe('isInPalace', () => {
  it('should include the corners of the Black Palace and exclude the points next to them', () => {
    expect(isInPalace({ x: 3, y: 0 }, Side.BLACK)).toBe(true);
    expect(isInPalace({ x: 5, y: 2 }, Side.BLACK)).toBe(true);
    expect(isInPalace({ x: 2, y: 0 }, Side.BLACK)).toBe(false);
    expect(isInPalace({ x: 3, y: 3 }, Side.BLACK)).toBe(false);
  });

  it('should include the corners of the Red Palace and exclude the points next to them', () => {
    expect(isInPalace({ x: 3, y: 7 }, Side.RED)).toBe(true);
    expect(isInPalace({ x: 5, y: 9 }, Side.RED)).toBe(true);
    expect(isInPalace({ x: 6, y: 9 }, Side.RED)).toBe(false);
    expect(isInPalace({ x: 3, y: 6 }, Side.RED)).toBe(false);
  });

  it('should not report a point of the Red Palace as inside the Black Palace', () => {
    expect(isInPalace({ x: 4, y: 8 }, Side.BLACK)).toBe(false);
    expect(isInPalace({ x: 4, y: 1 }, Side.RED)).toBe(false);
  });

  it('should have exactly 9 points in each Palace', () => {
    for (const side of [Side.BLACK, Side.RED]) {
      expect(allPoints().filter((point) => isInPalace(point, side))).toHaveLength(9);
    }
  });

  it('should return an error for a point outside the board', () => {
    for (const point of OUTSIDE) {
      expect(codeOf(() => isInPalace(point, Side.BLACK))).toBe(BoardErrorCode.POINT_OUT_OF_BOARD);
    }
  });
});

describe('riverSideOf', () => {
  it('should lie between y 4 (Black bank) and y 5 (Red bank)', () => {
    expect(RIVER.BLACK_BANK_Y).toBe(4);
    expect(RIVER.RED_BANK_Y).toBe(5);
    expect(riverSideOf({ x: 0, y: 4 })).toBe(Side.BLACK);
    expect(riverSideOf({ x: 0, y: 5 })).toBe(Side.RED);
  });

  it('should give the Black side for y 0 to 4 and the Red side for y 5 to 9', () => {
    expect(riverSideOf({ x: 4, y: 0 })).toBe(Side.BLACK);
    expect(riverSideOf({ x: 4, y: 9 })).toBe(Side.RED);
  });

  it('should give each side exactly 45 points', () => {
    const points = allPoints();
    expect(points.filter((point) => riverSideOf(point) === Side.BLACK)).toHaveLength(45);
    expect(points.filter((point) => riverSideOf(point) === Side.RED)).toHaveLength(45);
  });

  it('should return an error for a point outside the board', () => {
    for (const point of OUTSIDE) {
      expect(codeOf(() => riverSideOf(point))).toBe(BoardErrorCode.POINT_OUT_OF_BOARD);
    }
  });
});

describe('isAcrossRiver', () => {
  it('should be false on the own half and true on the opponent half', () => {
    expect(isAcrossRiver({ x: 0, y: 4 }, Side.BLACK)).toBe(false);
    expect(isAcrossRiver({ x: 0, y: 5 }, Side.BLACK)).toBe(true);
    expect(isAcrossRiver({ x: 0, y: 5 }, Side.RED)).toBe(false);
    expect(isAcrossRiver({ x: 0, y: 4 }, Side.RED)).toBe(true);
  });
});

describe('getZone', () => {
  it('should say a point in the Black Palace is on the Black side of the river', () => {
    expect(getZone({ x: 4, y: 1 })).toEqual({ palace: Side.BLACK, riverSide: Side.BLACK });
  });

  it('should say a point in the Red Palace is on the Red side of the river', () => {
    expect(getZone({ x: 4, y: 8 })).toEqual({ palace: Side.RED, riverSide: Side.RED });
  });

  it('should say a point outside both Palaces has no Palace', () => {
    expect(getZone({ x: 0, y: 4 })).toEqual({ palace: null, riverSide: Side.BLACK });
    expect(getZone({ x: 8, y: 5 })).toEqual({ palace: null, riverSide: Side.RED });
  });

  it('should match the constants of the Palaces for all 90 points', () => {
    for (const point of allPoints()) {
      const inX = point.x >= PALACE.MIN_X && point.x <= PALACE.MAX_X;
      const black = inX && point.y >= PALACE.BLACK.MIN_Y && point.y <= PALACE.BLACK.MAX_Y;
      const red = inX && point.y >= PALACE.RED.MIN_Y && point.y <= PALACE.RED.MAX_Y;
      const expected = black ? Side.BLACK : red ? Side.RED : null;
      expect(getZone(point).palace).toBe(expected);
    }
  });

  it('should return an error for a point outside the board', () => {
    for (const point of OUTSIDE) {
      expect(codeOf(() => getZone(point))).toBe(BoardErrorCode.POINT_OUT_OF_BOARD);
    }
  });
});
