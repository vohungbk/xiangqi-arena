import { describe, expect, it } from 'vitest';
import {
  allPoints,
  BOARD,
  BoardError,
  BoardErrorCode,
  FILE_LETTERS,
  isInsideBoard,
  moveToText,
  parsePoint,
  pointToText,
  textToMove,
  textToPoint,
} from './board';

function codeOf(run: () => unknown): BoardErrorCode | undefined {
  try {
    run();
  } catch (error) {
    if (error instanceof BoardError) return error.code;
    throw error;
  }
  return undefined;
}

describe('board size', () => {
  it('should have 9 files, 10 ranks and 90 points', () => {
    expect(BOARD.FILES).toBe(9);
    expect(BOARD.RANKS).toBe(10);
    expect(BOARD.POINTS).toBe(90);
    expect(BOARD.FILES * BOARD.RANKS).toBe(BOARD.POINTS);
  });

  it('should list 90 different points, all inside the board', () => {
    const points = allPoints();
    expect(points).toHaveLength(90);
    expect(new Set(points.map((p) => `${p.x},${p.y}`)).size).toBe(90);
    expect(points.every(isInsideBoard)).toBe(true);
  });

  it('should name the 9 files a to i from left to right', () => {
    expect(FILE_LETTERS).toBe('abcdefghi');
    expect(FILE_LETTERS).toHaveLength(BOARD.FILES);
  });
});

describe('isInsideBoard', () => {
  it('should accept the corners (0, 0) and (8, 9)', () => {
    expect(isInsideBoard({ x: 0, y: 0 })).toBe(true);
    expect(isInsideBoard({ x: 8, y: 9 })).toBe(true);
  });

  it('should accept x 0 and 8 and y 0 and 9', () => {
    for (const x of [0, 8]) for (const y of [0, 9]) expect(isInsideBoard({ x, y })).toBe(true);
  });

  it('should reject x -1, x 9, y -1 and y 10', () => {
    expect(isInsideBoard({ x: -1, y: 0 })).toBe(false);
    expect(isInsideBoard({ x: 9, y: 0 })).toBe(false);
    expect(isInsideBoard({ x: 0, y: -1 })).toBe(false);
    expect(isInsideBoard({ x: 0, y: 10 })).toBe(false);
  });

  it('should reject a fraction and NaN', () => {
    expect(isInsideBoard({ x: 1.5, y: 2 })).toBe(false);
    expect(isInsideBoard({ x: Number.NaN, y: 2 })).toBe(false);
  });
});

describe('pointToText and textToPoint', () => {
  it('should map y 0 to rank 9 and y 9 to rank 0', () => {
    expect(pointToText({ x: 0, y: 0 })).toBe('a9');
    expect(pointToText({ x: 8, y: 9 })).toBe('i0');
  });

  it('should read b2 as x 1 and y 7', () => {
    expect(textToPoint('b2')).toEqual({ x: 1, y: 7 });
    expect(pointToText({ x: 1, y: 7 })).toBe('b2');
  });

  it('should give the same point after text and back for all 90 points', () => {
    for (const point of allPoints()) expect(textToPoint(pointToText(point))).toEqual(point);
  });

  it('should return an error for a text outside the board or malformed', () => {
    for (const text of ['j1', 'a10', 'A1', '', 'b', 'b22', '1b']) {
      expect(codeOf(() => textToPoint(text))).toBe(BoardErrorCode.INVALID_POINT_TEXT);
    }
  });

  it('should return an error when writing a point outside the board', () => {
    expect(codeOf(() => pointToText({ x: 9, y: 0 }))).toBe(BoardErrorCode.POINT_OUT_OF_BOARD);
  });
});

describe('moveToText and textToMove', () => {
  it('should write the move b2e2 as two points', () => {
    expect(textToMove('b2e2')).toEqual({ from: { x: 1, y: 7 }, to: { x: 4, y: 7 } });
    expect(moveToText({ x: 1, y: 7 }, { x: 4, y: 7 })).toBe('b2e2');
  });

  it('should return an error for a move text that is not 4 characters or has a bad point', () => {
    expect(codeOf(() => textToMove('b2e'))).toBe(BoardErrorCode.INVALID_MOVE_TEXT);
    expect(codeOf(() => textToMove('b2e22'))).toBe(BoardErrorCode.INVALID_MOVE_TEXT);
    expect(codeOf(() => textToMove('b2z2'))).toBe(BoardErrorCode.INVALID_POINT_TEXT);
  });
});

describe('parsePoint', () => {
  it('should keep {x, y} with y from top to bottom after a JSON round trip', () => {
    const point = { x: 4, y: 0 };
    expect(parsePoint(JSON.parse(JSON.stringify(point)))).toEqual(point);
  });

  it('should drop fields other than x and y', () => {
    expect(parsePoint({ x: 1, y: 2, extra: 'no' })).toEqual({ x: 1, y: 2 });
  });

  it('should return an error for a point outside the board', () => {
    expect(codeOf(() => parsePoint({ x: 9, y: 0 }))).toBe(BoardErrorCode.POINT_OUT_OF_BOARD);
    expect(codeOf(() => parsePoint({ x: 0, y: 10 }))).toBe(BoardErrorCode.POINT_OUT_OF_BOARD);
  });

  it('should return an error for a value that is not a point of numbers', () => {
    for (const value of [
      null,
      undefined,
      'b2',
      [],
      { x: '1', y: 2 },
      { x: 1 },
      { x: 1, y: null },
    ]) {
      expect(codeOf(() => parsePoint(value))).toBe(BoardErrorCode.INVALID_POINT);
    }
  });

  it('should return an error for a fraction or NaN', () => {
    expect(codeOf(() => parsePoint({ x: 1.5, y: 2 }))).toBe(BoardErrorCode.POINT_OUT_OF_BOARD);
    expect(codeOf(() => parsePoint({ x: Number.NaN, y: 2 }))).toBe(
      BoardErrorCode.POINT_OUT_OF_BOARD,
    );
  });
});
