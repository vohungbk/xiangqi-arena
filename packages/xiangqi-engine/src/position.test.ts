import { describe, expect, it } from 'vitest';
import {
  allPoints,
  BoardError,
  BoardErrorCode,
  PieceType,
  Side,
  START_FEN,
  type Piece,
  type Point,
} from '@xiangqi/shared-types';
import { createStartingPosition, getPiece, positionsEqual, positionToFen } from './position';

const STANDARD_FEN = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1';

/** Back rank of a side from file a to file i. */
const BACK_RANK: PieceType[] = [
  PieceType.CHARIOT,
  PieceType.HORSE,
  PieceType.ELEPHANT,
  PieceType.ADVISOR,
  PieceType.GENERAL,
  PieceType.ADVISOR,
  PieceType.ELEPHANT,
  PieceType.HORSE,
  PieceType.CHARIOT,
];

/** The 32 pieces of the WXF setup, written by hand and not taken from START_FEN. */
function expectedPieces(): Map<string, Piece> {
  const expected = new Map<string, Piece>();
  const put = (x: number, y: number, type: PieceType, side: Side) =>
    expected.set(`${x},${y}`, { type, side });
  BACK_RANK.forEach((type, x) => {
    put(x, 0, type, Side.BLACK);
    put(x, 9, type, Side.RED);
  });
  put(1, 2, PieceType.CANNON, Side.BLACK);
  put(7, 2, PieceType.CANNON, Side.BLACK);
  put(1, 7, PieceType.CANNON, Side.RED);
  put(7, 7, PieceType.CANNON, Side.RED);
  for (const x of [0, 2, 4, 6, 8]) {
    put(x, 3, PieceType.SOLDIER, Side.BLACK);
    put(x, 6, PieceType.SOLDIER, Side.RED);
  }
  return expected;
}

function codeOf(run: () => unknown): BoardErrorCode | undefined {
  try {
    run();
  } catch (error) {
    if (error instanceof BoardError) return error.code;
    throw error;
  }
  return undefined;
}

describe('createStartingPosition', () => {
  it('should create the standard starting position with 32 pieces, 16 for each side', () => {
    const position = createStartingPosition();
    const pieces = allPoints()
      .map((point) => getPiece(position, point))
      .filter((piece): piece is Piece => piece !== null);
    expect(pieces).toHaveLength(32);
    expect(pieces.filter((piece) => piece.side === Side.RED)).toHaveLength(16);
    expect(pieces.filter((piece) => piece.side === Side.BLACK)).toHaveLength(16);
  });

  it('should write the starting position as the standard FEN', () => {
    expect(positionToFen(createStartingPosition())).toBe(STANDARD_FEN);
    expect(positionToFen(createStartingPosition())).toBe(START_FEN);
  });

  it('should put every piece where the WXF setup puts it', () => {
    const position = createStartingPosition();
    const expected = expectedPieces();
    expect(expected.size).toBe(32);
    for (const point of allPoints()) {
      expect(getPiece(position, point), `(${point.x}, ${point.y})`).toEqual(
        expected.get(`${point.x},${point.y}`) ?? null,
      );
    }
  });

  it('should start with Red to move, half-move counter 0 and full-move number 1', () => {
    const position = createStartingPosition();
    expect(position.turn).toBe(Side.RED);
    expect(position.halfmoveClock).toBe(0);
    expect(position.fullmoveNumber).toBe(1);
  });

  it('should be equal when created twice but not the same object', () => {
    const first = createStartingPosition();
    const second = createStartingPosition();
    expect(first).not.toBe(second);
    expect(first.board).not.toBe(second.board);
    expect(positionsEqual(first, second)).toBe(true);
    expect(first).toEqual(second);
  });

  it('should not change another new game when one game is changed', () => {
    const first = createStartingPosition();
    const second = createStartingPosition();
    first.board[0]![0] = null;
    first.board[9]![4] = { type: PieceType.SOLDIER, side: Side.BLACK };
    first.turn = Side.BLACK;
    expect(positionToFen(second)).toBe(STANDARD_FEN);
    expect(positionsEqual(second, createStartingPosition())).toBe(true);
  });
});

describe('positionsEqual', () => {
  it('should not be equal when one piece differs', () => {
    const changed = createStartingPosition();
    changed.board[3]![0] = null;
    expect(positionsEqual(createStartingPosition(), changed)).toBe(false);
  });

  it('should not be equal when the side to move differs', () => {
    const changed = createStartingPosition();
    changed.turn = Side.BLACK;
    expect(positionsEqual(createStartingPosition(), changed)).toBe(false);
  });

  it('should ignore the move counters', () => {
    const changed = createStartingPosition();
    changed.halfmoveClock = 7;
    changed.fullmoveNumber = 12;
    expect(positionsEqual(createStartingPosition(), changed)).toBe(true);
  });
});

describe('getPiece', () => {
  const position = createStartingPosition();

  it('should return null for an empty point', () => {
    expect(getPiece(position, { x: 4, y: 4 })).toBeNull();
  });

  it('should throw a BoardError and not return a piece for a point outside the board', () => {
    const outside: Point[] = [
      { x: -1, y: 0 },
      { x: 9, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 10 },
    ];
    for (const point of outside) {
      expect(codeOf(() => getPiece(position, point))).toBe(BoardErrorCode.POINT_OUT_OF_BOARD);
    }
  });
});
