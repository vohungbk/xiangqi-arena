import { describe, expect, it } from 'vitest';
import {
  BoardError,
  BoardErrorCode,
  PieceType,
  Side,
  textToMove,
  type PlacedPiece,
  type Point,
  type Position,
} from '@xiangqi/shared-types';
import {
  applyMove,
  clonePosition,
  createPosition,
  createStartingPosition,
  positionsEqual,
  positionToFen,
  readAllPoints,
} from './position';
import { getZone } from './zones';

function piece(type: PieceType, side: Side, x: number, y: number): PlacedPiece {
  return { type, side, point: { x, y } };
}

/** The 32 pieces of the starting position as a list. */
function startingPieces(): PlacedPiece[] {
  return readAllPoints(createStartingPosition())
    .map(({ piece: found }) => found)
    .filter((found): found is PlacedPiece => found !== null);
}

/** How many pieces of a type a side has in a position. */
function count(position: Position, side: Side, type: PieceType): number {
  return readAllPoints(position).filter(
    ({ piece: found }) => found?.side === side && found.type === type,
  ).length;
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

describe('createPosition', () => {
  it('should build the starting position from a list of its 32 pieces', () => {
    const built = createPosition({ pieces: startingPieces(), turn: Side.RED });
    expect(positionsEqual(built, createStartingPosition())).toBe(true);
    expect(positionToFen(built)).toBe(positionToFen(createStartingPosition()));
  });

  it('should default the counters to 0 and 1 and keep the counters it is given', () => {
    const plain = createPosition({ pieces: [], turn: Side.RED });
    expect(plain.halfmoveClock).toBe(0);
    expect(plain.fullmoveNumber).toBe(1);
    const given = createPosition({
      pieces: [],
      turn: Side.BLACK,
      halfmoveClock: 12,
      fullmoveNumber: 30,
    });
    expect(given.turn).toBe(Side.BLACK);
    expect(given.halfmoveClock).toBe(12);
    expect(given.fullmoveNumber).toBe(30);
  });

  it('should keep a position with no Red General as data', () => {
    const pieces = startingPieces().filter(
      (found) => !(found.type === PieceType.GENERAL && found.side === Side.RED),
    );
    const position = createPosition({ pieces, turn: Side.RED });
    expect(count(position, Side.RED, PieceType.GENERAL)).toBe(0);
    expect(readAllPoints(position)).toHaveLength(90);
    expect(positionToFen(position)).toBe(
      'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBA1ABNR w - - 0 1',
    );
  });

  it('should keep a position with 3 Cannons for one side', () => {
    const pieces = [...startingPieces(), piece(PieceType.CANNON, Side.RED, 4, 5)];
    const position = createPosition({ pieces, turn: Side.RED });
    expect(count(position, Side.RED, PieceType.CANNON)).toBe(3);
  });

  it('should build positions that break the rules of the game without any error', () => {
    const cases: PlacedPiece[][] = [
      [],
      [piece(PieceType.GENERAL, Side.RED, 4, 9)],
      [
        piece(PieceType.GENERAL, Side.RED, 4, 9),
        piece(PieceType.GENERAL, Side.RED, 3, 9),
        piece(PieceType.GENERAL, Side.BLACK, 4, 0),
      ],
      [piece(PieceType.GENERAL, Side.RED, 0, 5), piece(PieceType.GENERAL, Side.BLACK, 8, 4)],
      [piece(PieceType.GENERAL, Side.RED, 4, 9), piece(PieceType.GENERAL, Side.BLACK, 4, 0)],
      Array.from({ length: 9 }, (_, x) => piece(PieceType.SOLDIER, Side.RED, x, 5)).concat(
        Array.from({ length: 9 }, (_, x) => piece(PieceType.SOLDIER, Side.RED, x, 6)),
      ),
    ];
    for (const pieces of cases) {
      const position = createPosition({ pieces, turn: Side.RED });
      expect(readAllPoints(position).filter(({ piece: found }) => found !== null)).toHaveLength(
        pieces.length,
      );
      expect(typeof positionToFen(position)).toBe('string');
      expect(positionsEqual(position, clonePosition(position))).toBe(true);
      for (const point of readAllPoints(position).map((reading) => reading.point)) {
        expect(getZone(point)).toBeDefined();
      }
    }
  });

  it('should let the engine apply a move on a position that the rules would refuse', () => {
    const position = createPosition({
      pieces: [piece(PieceType.CHARIOT, Side.RED, 0, 9), piece(PieceType.CANNON, Side.BLACK, 0, 0)],
      turn: Side.RED,
    });
    const next = applyMove(position, textToMove('a0a9'));
    expect(next.turn).toBe(Side.BLACK);
    expect(count(next, Side.BLACK, PieceType.CANNON)).toBe(0);
  });

  it('should throw a BoardError for a piece outside the board', () => {
    const outside: Point[] = [
      { x: -1, y: 0 },
      { x: 9, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 10 },
    ];
    for (const point of outside) {
      const pieces = [{ type: PieceType.SOLDIER, side: Side.RED, point }];
      expect(codeOf(() => createPosition({ pieces, turn: Side.RED }))).toBe(
        BoardErrorCode.POINT_OUT_OF_BOARD,
      );
    }
  });

  it('should throw a BoardError when two pieces are on the same point', () => {
    const pieces = [
      piece(PieceType.SOLDIER, Side.RED, 4, 5),
      piece(PieceType.HORSE, Side.BLACK, 4, 5),
    ];
    expect(codeOf(() => createPosition({ pieces, turn: Side.RED }))).toBe(
      BoardErrorCode.POINT_OCCUPIED,
    );
  });

  it('should not keep a reference to the list or the pieces it was built from', () => {
    const pieces = startingPieces();
    const position: Position = createPosition({ pieces, turn: Side.RED });
    const fen = positionToFen(position);
    pieces[0]!.type = PieceType.SOLDIER;
    pieces[0]!.point.x = 8;
    pieces.pop();
    expect(positionToFen(position)).toBe(fen);
  });
});
