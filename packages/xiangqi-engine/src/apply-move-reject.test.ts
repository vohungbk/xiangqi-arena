import { describe, expect, it } from 'vitest';
import {
  BoardError,
  BoardErrorCode,
  Side,
  textToMove,
  type Move,
  type Position,
} from '@xiangqi/shared-types';
import { applyMove, createStartingPosition, positionToFen } from './position';

/** Apply a move that must be refused. Return the code and check the position is as it was. */
function refuse(position: Position, move: Move): BoardErrorCode {
  const before = positionToFen(position);
  let code: BoardErrorCode | undefined;
  try {
    applyMove(position, move);
  } catch (error) {
    if (!(error instanceof BoardError)) throw error;
    code = error.code;
  }
  expect(code, 'the move must be refused').toBeDefined();
  expect(positionToFen(position)).toBe(before);
  return code as BoardErrorCode;
}

describe('applyMove refuses a bad move', () => {
  it('should still apply a legal move for the side to move', () => {
    const next = applyMove(createStartingPosition(), textToMove('b2e2'));
    expect(next.turn).toBe(Side.BLACK);
    expect(positionToFen(next)).toBe(
      'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/4C2C1/9/RNBAKABNR b - - 1 1',
    );
  });

  it('should refuse a move from an empty point and keep the position', () => {
    const code = refuse(createStartingPosition(), { from: { x: 4, y: 4 }, to: { x: 4, y: 5 } });
    expect(code).toBe(BoardErrorCode.MOVE_FROM_EMPTY_POINT);
  });

  it('should refuse a move onto a piece of the same side and keep the position', () => {
    // The Red chariot at a0 onto the Red horse at b0.
    const code = refuse(createStartingPosition(), { from: { x: 0, y: 9 }, to: { x: 1, y: 9 } });
    expect(code).toBe(BoardErrorCode.MOVE_ONTO_OWN_PIECE);
  });

  it('should refuse a move from a point to itself', () => {
    const code = refuse(createStartingPosition(), { from: { x: 4, y: 9 }, to: { x: 4, y: 9 } });
    expect(code).toBe(BoardErrorCode.MOVE_ONTO_OWN_PIECE);
  });

  it('should refuse a move with a point outside the board and keep the position', () => {
    const moves: Move[] = [
      { from: { x: 9, y: 0 }, to: { x: 0, y: 0 } },
      { from: { x: 0, y: 9 }, to: { x: 0, y: 10 } },
      { from: { x: 0, y: -1 }, to: { x: 0, y: 0 } },
      { from: { x: 0, y: 9 }, to: { x: -1, y: 9 } },
    ];
    for (const move of moves) {
      expect(refuse(createStartingPosition(), move)).toBe(BoardErrorCode.POINT_OUT_OF_BOARD);
    }
  });

  it('should refuse a Black move when Red is to move', () => {
    // Black moves first: the Black cannon at b7 to e7 while it is the turn of Red.
    const code = refuse(createStartingPosition(), textToMove('b7e7'));
    expect(code).toBe(BoardErrorCode.MOVE_OUT_OF_TURN);
  });

  it('should refuse a Red move when Black is to move', () => {
    const afterRed = applyMove(createStartingPosition(), textToMove('b2e2'));
    expect(refuse(afterRed, textToMove('e2b2'))).toBe(BoardErrorCode.MOVE_OUT_OF_TURN);
  });

  it('should report the empty point before the turn when both apply', () => {
    // An empty source on the Black half while Red is to move.
    const code = refuse(createStartingPosition(), { from: { x: 4, y: 1 }, to: { x: 4, y: 2 } });
    expect(code).toBe(BoardErrorCode.MOVE_FROM_EMPTY_POINT);
  });

  it('should refuse the same bad move twice with the same result', () => {
    const position = createStartingPosition();
    const move: Move = { from: { x: 4, y: 4 }, to: { x: 4, y: 5 } };
    expect(refuse(position, move)).toBe(refuse(position, move));
  });

  it('should keep working after a refused move', () => {
    const position = createStartingPosition();
    refuse(position, { from: { x: 4, y: 4 }, to: { x: 4, y: 5 } });
    const next = applyMove(position, textToMove('b2e2'));
    expect(next.turn).toBe(Side.BLACK);
  });
});
