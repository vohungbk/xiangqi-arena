import { describe, expect, it } from 'vitest';
import {
  BoardError,
  BoardErrorCode,
  PieceType,
  Side,
  textToMove,
  type PlacedPiece,
  type Position,
} from '@xiangqi/shared-types';
import {
  applyMove,
  applyMoveWithCapture,
  createStartingPosition,
  getPiece,
  positionsEqual,
  positionToFen,
} from './position';

const START = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1';

/** The position after a Red cannon move and a quiet Black move, ready for a capture at c6. */
function readyForCapture(): Position {
  const first = applyMoveWithCapture(createStartingPosition(), textToMove('b2c2'));
  return applyMoveWithCapture(first.position, textToMove('b7e7')).position;
}

describe('applyMoveWithCapture', () => {
  it('should report the captured Soldier with its type, side and point', () => {
    const result = applyMoveWithCapture(readyForCapture(), textToMove('c2c6'));
    expect(result.captured).toEqual({
      type: PieceType.SOLDIER,
      side: Side.BLACK,
      point: { x: 2, y: 3 },
    });
    expect(getPiece(result.position, { x: 2, y: 3 })).toEqual({
      type: PieceType.CANNON,
      side: Side.RED,
    });
  });

  it('should report no captured piece for a quiet move', () => {
    const result = applyMoveWithCapture(createStartingPosition(), textToMove('b2e2'));
    expect(result.captured).toBeNull();
  });

  it('should give the same position as applyMove', () => {
    const before = readyForCapture();
    const move = textToMove('c2c6');
    expect(
      positionsEqual(applyMoveWithCapture(before, move).position, applyMove(before, move)),
    ).toBe(true);
    expect(positionToFen(applyMoveWithCapture(before, move).position)).toBe(
      positionToFen(applyMove(before, move)),
    );
  });

  it('should report the captured piece as a copy that does not change the position', () => {
    const result = applyMoveWithCapture(readyForCapture(), textToMove('c2c6'));
    const fen = positionToFen(result.position);
    result.captured!.type = PieceType.GENERAL;
    result.captured!.point.x = 0;
    expect(positionToFen(result.position)).toBe(fen);
  });

  it('should report a captured General like any other piece', () => {
    const result = applyMoveWithCapture(createStartingPosition(), {
      from: { x: 4, y: 9 },
      to: { x: 4, y: 0 },
    });
    expect(result.captured).toEqual({
      type: PieceType.GENERAL,
      side: Side.BLACK,
      point: { x: 4, y: 0 },
    });
  });

  it('should read the captures of a sequence of moves from the results alone', () => {
    const moves = ['b2c2', 'b7e7', 'c2c6', 'e7e3', 'c6c9'];
    let position = createStartingPosition();
    const captures: PlacedPiece[] = [];
    for (const text of moves) {
      const result = applyMoveWithCapture(position, textToMove(text));
      if (result.captured) captures.push(result.captured);
      position = result.position;
    }
    // Red takes the Black Soldier at c6, Black takes the Red Soldier at e3, Red takes the
    // Black Elephant at c9. The list is built from the results only.
    expect(captures.map(({ type, side }) => `${side} ${type}`)).toEqual([
      'BLACK SOLDIER',
      'RED SOLDIER',
      'BLACK ELEPHANT',
    ]);
  });

  it('should still refuse a bad move and not return a result', () => {
    const start = createStartingPosition();
    const bad = [
      { from: { x: 4, y: 4 }, to: { x: 4, y: 5 } },
      { from: { x: 0, y: 9 }, to: { x: 1, y: 9 } },
      { from: { x: 1, y: 2 }, to: { x: 4, y: 2 } },
      { from: { x: 9, y: 0 }, to: { x: 0, y: 0 } },
    ];
    const codes = bad.map((move) => {
      try {
        applyMoveWithCapture(start, move);
      } catch (error) {
        return error instanceof BoardError ? error.code : undefined;
      }
      return undefined;
    });
    expect(codes).toEqual([
      BoardErrorCode.MOVE_FROM_EMPTY_POINT,
      BoardErrorCode.MOVE_ONTO_OWN_PIECE,
      BoardErrorCode.MOVE_OUT_OF_TURN,
      BoardErrorCode.POINT_OUT_OF_BOARD,
    ]);
    expect(positionToFen(start)).toBe(START);
  });
});
