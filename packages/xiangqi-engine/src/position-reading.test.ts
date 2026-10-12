import { describe, expect, it } from 'vitest';
import { BoardError, BoardErrorCode, PieceType, Side, type Point } from '@xiangqi/shared-types';
import {
  clonePosition,
  createStartingPosition,
  getPiece,
  positionsEqual,
  positionToFen,
  readAllPoints,
  readPoint,
} from './position';

function codeOf(run: () => unknown): BoardErrorCode | undefined {
  try {
    run();
  } catch (error) {
    if (error instanceof BoardError) return error.code;
    throw error;
  }
  return undefined;
}

describe('readPoint', () => {
  const position = createStartingPosition();

  it('should read a piece with its type, side and point', () => {
    expect(readPoint(position, { x: 4, y: 0 })).toEqual({
      type: PieceType.GENERAL,
      side: Side.BLACK,
      point: { x: 4, y: 0 },
    });
    expect(readPoint(position, { x: 1, y: 7 })).toEqual({
      type: PieceType.CANNON,
      side: Side.RED,
      point: { x: 1, y: 7 },
    });
    expect(readPoint(position, { x: 8, y: 6 })).toEqual({
      type: PieceType.SOLDIER,
      side: Side.RED,
      point: { x: 8, y: 6 },
    });
  });

  it('should return null for an empty point', () => {
    expect(readPoint(position, { x: 4, y: 4 })).toBeNull();
  });

  it('should throw a BoardError for a point outside the board', () => {
    const outside: Point[] = [
      { x: -1, y: 0 },
      { x: 9, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 10 },
    ];
    for (const point of outside) {
      expect(codeOf(() => readPoint(position, point))).toBe(BoardErrorCode.POINT_OUT_OF_BOARD);
    }
  });

  it('should not change the position when a piece read from it is changed', () => {
    const read = readPoint(position, { x: 4, y: 0 });
    expect(read).not.toBeNull();
    read!.type = PieceType.SOLDIER;
    read!.side = Side.RED;
    read!.point.x = 0;
    expect(readPoint(position, { x: 4, y: 0 })).toEqual({
      type: PieceType.GENERAL,
      side: Side.BLACK,
      point: { x: 4, y: 0 },
    });
  });

  it('should not change the position when a piece from getPiece is changed', () => {
    const piece = getPiece(position, { x: 0, y: 0 });
    piece!.type = PieceType.SOLDIER;
    expect(getPiece(position, { x: 0, y: 0 })?.type).toBe(PieceType.CHARIOT);
  });
});

describe('readAllPoints', () => {
  const position = createStartingPosition();

  it('should return 90 readings with no point twice', () => {
    const readings = readAllPoints(position);
    expect(readings).toHaveLength(90);
    expect(new Set(readings.map(({ point }) => `${point.x},${point.y}`)).size).toBe(90);
  });

  it('should give 32 pieces and 58 empty points at the start', () => {
    const readings = readAllPoints(position);
    expect(readings.filter(({ piece }) => piece !== null)).toHaveLength(32);
    expect(readings.filter(({ piece }) => piece === null)).toHaveLength(58);
  });

  it('should report on each piece the same point as its reading', () => {
    for (const { point, piece } of readAllPoints(position)) {
      if (piece) expect(piece.point).toEqual(point);
    }
  });
});

describe('position content', () => {
  it('should hold only the board, the side to move and the two counters, with no history', () => {
    expect(Object.keys(createStartingPosition()).sort()).toEqual(
      ['board', 'fullmoveNumber', 'halfmoveClock', 'turn'].sort(),
    );
  });

  it('should hold a piece or empty at each of the 10 x 9 points and the side to move', () => {
    const position = createStartingPosition();
    expect(position.board).toHaveLength(10);
    for (const row of position.board) expect(row).toHaveLength(9);
    expect(position.turn).toBe(Side.RED);
  });

  it('should hold the half-move counter and the full-move number', () => {
    const position = createStartingPosition();
    expect(position.halfmoveClock).toBe(0);
    expect(position.fullmoveNumber).toBe(1);
  });
});

describe('clonePosition', () => {
  it('should be equal to the original but not the same object', () => {
    const original = createStartingPosition();
    const copy = clonePosition(original);
    expect(copy).not.toBe(original);
    expect(copy.board).not.toBe(original.board);
    expect(copy.board[0]).not.toBe(original.board[0]);
    expect(positionsEqual(copy, original)).toBe(true);
  });

  it('should not change the original when the copy is changed', () => {
    const original = createStartingPosition();
    const copy = clonePosition(original);
    copy.board[0]![0] = null;
    copy.board[9]![4]!.type = PieceType.SOLDIER;
    copy.turn = Side.BLACK;
    copy.halfmoveClock = 9;
    copy.fullmoveNumber = 9;
    expect(positionToFen(original)).toBe(positionToFen(createStartingPosition()));
    expect(original.turn).toBe(Side.RED);
    expect(original.halfmoveClock).toBe(0);
    expect(original.fullmoveNumber).toBe(1);
  });

  it('should keep the half-move counter and the full-move number in the copy and in the FEN', () => {
    const original = createStartingPosition();
    original.turn = Side.BLACK;
    original.halfmoveClock = 3;
    original.fullmoveNumber = 8;
    const copy = clonePosition(original);
    expect(copy.halfmoveClock).toBe(3);
    expect(copy.fullmoveNumber).toBe(8);
    expect(positionToFen(copy)).toMatch(/ b - - 3 8$/);
  });
});
