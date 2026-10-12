import { describe, expect, it } from 'vitest';
import {
  BoardError,
  BoardErrorCode,
  PieceType,
  Side,
  textToMove,
  type Position,
} from '@xiangqi/shared-types';
import {
  applyMove,
  createStartingPosition,
  getPiece,
  positionsEqual,
  positionToFen,
  readAllPoints,
} from './position';

const START = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1';

function pieceCount(position: Position): number {
  return readAllPoints(position).filter(({ piece }) => piece !== null).length;
}

describe('applyMove', () => {
  it('should move the piece to the target point', () => {
    const next = applyMove(createStartingPosition(), textToMove('b2e2'));
    expect(getPiece(next, { x: 4, y: 7 })).toEqual({ type: PieceType.CANNON, side: Side.RED });
    expect(getPiece(next, { x: 1, y: 7 })).toBeNull();
    expect(positionToFen(next)).toBe(
      'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/4C2C1/9/RNBAKABNR b - - 1 1',
    );
  });

  it('should remove the piece of the other side on the target point', () => {
    // The Red cannon at b2 jumps over the Black cannon at b7 and takes the horse at b9.
    const start = createStartingPosition();
    const next = applyMove(start, { from: { x: 1, y: 7 }, to: { x: 1, y: 0 } });
    expect(getPiece(next, { x: 1, y: 0 })).toEqual({ type: PieceType.CANNON, side: Side.RED });
    expect(getPiece(next, { x: 1, y: 7 })).toBeNull();
    expect(pieceCount(start)).toBe(32);
    expect(pieceCount(next)).toBe(31);
    expect(
      readAllPoints(next).filter(
        ({ piece }) => piece?.side === Side.BLACK && piece.type === PieceType.HORSE,
      ),
    ).toHaveLength(1);
  });

  it('should switch the side to move', () => {
    const afterRed = applyMove(createStartingPosition(), textToMove('b2e2'));
    expect(afterRed.turn).toBe(Side.BLACK);
    const afterBlack = applyMove(afterRed, textToMove('b7e7'));
    expect(afterBlack.turn).toBe(Side.RED);
  });

  it('should not change the old position', () => {
    const start = createStartingPosition();
    const next = applyMove(start, textToMove('b2e2'));
    expect(next).not.toBe(start);
    expect(next.board).not.toBe(start.board);
    expect(positionToFen(start)).toBe(START);
    expect(positionsEqual(start, createStartingPosition())).toBe(true);
  });

  it('should not change the original when the returned position is changed', () => {
    const start = createStartingPosition();
    const next = applyMove(start, textToMove('b2e2'));
    next.board[0]![0] = null;
    next.board[9]![4]!.type = PieceType.SOLDIER;
    next.turn = Side.RED;
    next.halfmoveClock = 50;
    expect(positionToFen(start)).toBe(START);
  });

  it('should give a separate position for each of 10 moves in a row', () => {
    const moves = ['b2e2', 'b7e7', 'e2b2', 'e7b7', 'b2e2', 'b7e7', 'e2b2', 'e7b7', 'b2e2', 'b7e7'];
    const positions: Position[] = [createStartingPosition()];
    const fens: string[] = [positionToFen(positions[0]!)];
    for (const move of moves) {
      const next = applyMove(positions[positions.length - 1]!, textToMove(move));
      positions.push(next);
      fens.push(positionToFen(next));
    }
    expect(positions).toHaveLength(11);
    expect(new Set(positions).size).toBe(11);
    // Every older position is still as it was when it was made.
    positions.forEach((position, index) => expect(positionToFen(position)).toBe(fens[index]));
    expect(fens[0]).toBe(START);
    expect(positions[10]!.fullmoveNumber).toBe(6);
  });
});

describe('applyMove counters', () => {
  it('should add 1 to the half-move clock after a move without capture', () => {
    const start = createStartingPosition();
    const first = applyMove(start, textToMove('b2e2'));
    const second = applyMove(first, textToMove('b7e7'));
    expect(first.halfmoveClock).toBe(1);
    expect(second.halfmoveClock).toBe(2);
  });

  it('should reset the half-move clock to 0 after a capture', () => {
    const moved = applyMove(createStartingPosition(), textToMove('b2e2'));
    const again = applyMove(moved, textToMove('b7e7'));
    expect(again.halfmoveClock).toBe(2);
    // The Red cannon at e2 takes the Black cannon at e7 over the soldier at e4 (trusted move).
    const captured = applyMove(again, { from: { x: 4, y: 7 }, to: { x: 4, y: 2 } });
    expect(captured.halfmoveClock).toBe(0);
  });

  it('should add 1 to the full-move number after a Black move and not after a Red move', () => {
    const first = applyMove(createStartingPosition(), textToMove('b2e2'));
    expect(first.fullmoveNumber).toBe(1);
    const second = applyMove(first, textToMove('b7e7'));
    expect(second.fullmoveNumber).toBe(2);
    expect(positionToFen(second)).toMatch(/ w - - 2 2$/);
  });
});

describe('applyMove errors', () => {
  it('should throw a BoardError for a point outside the board', () => {
    const start = createStartingPosition();
    const bad = [
      { from: { x: 9, y: 0 }, to: { x: 0, y: 0 } },
      { from: { x: 0, y: 0 }, to: { x: 0, y: 10 } },
    ];
    for (const move of bad) {
      expect(() => applyMove(start, move)).toThrow(BoardError);
      try {
        applyMove(start, move);
      } catch (error) {
        expect((error as BoardError).code).toBe(BoardErrorCode.POINT_OUT_OF_BOARD);
      }
    }
    expect(positionToFen(start)).toBe(START);
  });
});
