import { describe, expect, it } from 'vitest';
import { MoveReasonCode, Side, textToMove, type Move, type Point } from '@xiangqi/shared-types';
import { checkBoundsAndSource, checkCapture, checkTurn } from './move-rules';
import { applyMove, createStartingPosition, positionToFen } from './position';

const START = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1';

/** The position after one Red move, so that Black is to move. */
function blackToMove() {
  return applyMove(createStartingPosition(), textToMove('b2e2'));
}

describe('checkTurn', () => {
  const position = createStartingPosition();

  it('should reject a Black piece when Red is to move with wrong_turn', () => {
    expect(checkTurn(position, textToMove('b7e7'))).toBe(MoveReasonCode.WRONG_TURN);
  });

  it('should pass a Red piece when Red is to move', () => {
    expect(position.turn).toBe(Side.RED);
    expect(checkTurn(position, textToMove('b2e2'))).toBeNull();
  });

  it('should switch the side that passes after a move', () => {
    const next = blackToMove();
    expect(next.turn).toBe(Side.BLACK);
    expect(checkTurn(next, textToMove('b7e7'))).toBeNull();
    expect(checkTurn(next, textToMove('e2b2'))).toBe(MoveReasonCode.WRONG_TURN);
  });

  it('should return null and not throw for a bad source, which checkBoundsAndSource reports', () => {
    const empty: Move = { from: { x: 4, y: 4 }, to: { x: 4, y: 5 } };
    const outside: Move = { from: { x: 9, y: 9 }, to: { x: 4, y: 5 } };
    expect(checkTurn(position, empty)).toBeNull();
    expect(checkTurn(position, outside)).toBeNull();
    expect(checkBoundsAndSource(position, empty)).toBe(MoveReasonCode.EMPTY_SOURCE);
    expect(checkBoundsAndSource(position, outside)).toBe(MoveReasonCode.OUT_OF_BOUNDS);
  });
});

describe('checkCapture', () => {
  const position = createStartingPosition();

  it('should reject a capture of an own piece with own_piece', () => {
    // The Red chariot at a0 onto the Red horse at b0.
    expect(checkCapture(position, { from: { x: 0, y: 9 }, to: { x: 1, y: 9 } })).toBe(
      MoveReasonCode.OWN_PIECE,
    );
  });

  it('should pass a capture of an opponent piece', () => {
    // The Red cannon at b2 onto the Black horse at b9.
    expect(checkCapture(position, { from: { x: 1, y: 7 }, to: { x: 1, y: 0 } })).toBeNull();
  });

  it('should pass a move to an empty target', () => {
    expect(checkCapture(position, textToMove('b2e2'))).toBeNull();
  });

  it('should reject an own piece for a Black piece as well', () => {
    expect(checkCapture(blackToMove(), { from: { x: 0, y: 0 }, to: { x: 1, y: 0 } })).toBe(
      MoveReasonCode.OWN_PIECE,
    );
  });

  it('should return null and not throw for a point outside the board or an empty source', () => {
    const cases: Move[] = [
      { from: { x: 4, y: 4 }, to: { x: 4, y: 9 } },
      { from: { x: 4, y: 9 }, to: { x: 9, y: 9 } },
      { from: { x: -1, y: 9 }, to: { x: 4, y: 9 } },
    ];
    for (const move of cases) expect(checkCapture(position, move)).toBeNull();
  });
});

describe('the turn rule and the capture rule together', () => {
  const position = createStartingPosition();

  it('should give both codes for a move that breaks both rules, so the order of the chain decides', () => {
    // Red is to move. The Black chariot at a9 onto the Black horse at b9.
    const move: Move = { from: { x: 0, y: 0 }, to: { x: 1, y: 0 } };
    expect(checkTurn(position, move)).toBe(MoveReasonCode.WRONG_TURN);
    expect(checkCapture(position, move)).toBe(MoveReasonCode.OWN_PIECE);
  });

  it('should not change the position and give the same result twice', () => {
    const points: Point[] = [
      { x: 0, y: 9 },
      { x: 1, y: 7 },
      { x: 0, y: 0 },
      { x: 4, y: 4 },
    ];
    for (const from of points) {
      for (const to of points) {
        const move: Move = { from, to };
        expect(checkTurn(position, move)).toBe(checkTurn(position, move));
        expect(checkCapture(position, move)).toBe(checkCapture(position, move));
      }
    }
    expect(positionToFen(position)).toBe(START);
  });

  it('should use the codes of the spec as values', () => {
    expect(MoveReasonCode.WRONG_TURN).toBe('wrong_turn');
    expect(MoveReasonCode.OWN_PIECE).toBe('own_piece');
  });
});
