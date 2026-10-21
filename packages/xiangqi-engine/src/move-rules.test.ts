import { describe, expect, it } from 'vitest';
import { MoveReasonCode, Side, textToMove, type Move, type Point } from '@xiangqi/shared-types';
import { checkBoundsAndSource } from './move-rules';
import { createStartingPosition, positionToFen } from './position';

const START = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1';
const OUTSIDE: Point[] = [
  { x: -1, y: 4 },
  { x: 9, y: 4 },
  { x: 4, y: -1 },
  { x: 4, y: 10 },
];

describe('checkBoundsAndSource', () => {
  const position = createStartingPosition();

  it('should pass a normal move to the next rule', () => {
    expect(checkBoundsAndSource(position, textToMove('b2e2'))).toBeNull();
  });

  it('should reject a source outside the board with out_of_bounds', () => {
    for (const from of OUTSIDE) {
      expect(checkBoundsAndSource(position, { from, to: { x: 4, y: 4 } })).toBe(
        MoveReasonCode.OUT_OF_BOUNDS,
      );
    }
  });

  it('should reject a target outside the board with out_of_bounds', () => {
    for (const to of OUTSIDE) {
      expect(checkBoundsAndSource(position, { from: { x: 4, y: 9 }, to })).toBe(
        MoveReasonCode.OUT_OF_BOUNDS,
      );
    }
  });

  it('should reject a point that is not a whole number with out_of_bounds', () => {
    const fractions: Move[] = [
      { from: { x: 1.5, y: 7 }, to: { x: 4, y: 7 } },
      { from: { x: 1, y: 7 }, to: { x: 4, y: Number.NaN } },
    ];
    for (const move of fractions) {
      expect(checkBoundsAndSource(position, move)).toBe(MoveReasonCode.OUT_OF_BOUNDS);
    }
  });

  it('should reject a move from an empty point with empty_source', () => {
    expect(checkBoundsAndSource(position, { from: { x: 4, y: 4 }, to: { x: 4, y: 5 } })).toBe(
      MoveReasonCode.EMPTY_SOURCE,
    );
  });

  it('should accept the corners and the edges as inside the board', () => {
    const edgeMoves: Move[] = [
      { from: { x: 0, y: 0 }, to: { x: 0, y: 1 } },
      { from: { x: 8, y: 0 }, to: { x: 8, y: 1 } },
      { from: { x: 0, y: 9 }, to: { x: 0, y: 8 } },
      { from: { x: 8, y: 9 }, to: { x: 8, y: 8 } },
      { from: { x: 0, y: 3 }, to: { x: 0, y: 9 } },
      { from: { x: 8, y: 6 }, to: { x: 8, y: 0 } },
    ];
    for (const move of edgeMoves) expect(checkBoundsAndSource(position, move)).toBeNull();
  });

  it('should reject a move from a point to itself with same_point', () => {
    expect(checkBoundsAndSource(position, { from: { x: 4, y: 9 }, to: { x: 4, y: 9 } })).toBe(
      MoveReasonCode.SAME_POINT,
    );
  });

  it('should report out_of_bounds before empty_source and empty_source before same_point', () => {
    const outsideAndEmpty = { from: { x: 4, y: 4 }, to: { x: 4, y: 10 } };
    expect(checkBoundsAndSource(position, outsideAndEmpty)).toBe(MoveReasonCode.OUT_OF_BOUNDS);
    const emptyAndSame = { from: { x: 4, y: 4 }, to: { x: 4, y: 4 } };
    expect(checkBoundsAndSource(position, emptyAndSame)).toBe(MoveReasonCode.EMPTY_SOURCE);
  });

  it('should not check the turn, which a later rule does', () => {
    expect(position.turn).toBe(Side.RED);
    expect(checkBoundsAndSource(position, textToMove('b7e7'))).toBeNull();
  });

  it('should not change the position and should give the same result twice', () => {
    const moves: Move[] = [
      textToMove('b2e2'),
      { from: { x: 4, y: 4 }, to: { x: 4, y: 5 } },
      { from: { x: 4, y: 9 }, to: { x: 4, y: 9 } },
      { from: { x: 9, y: 9 }, to: { x: 4, y: 9 } },
    ];
    for (const move of moves) {
      expect(checkBoundsAndSource(position, move)).toBe(checkBoundsAndSource(position, move));
    }
    expect(positionToFen(position)).toBe(START);
  });

  it('should use the codes of the spec as values', () => {
    expect(MoveReasonCode.OUT_OF_BOUNDS).toBe('out_of_bounds');
    expect(MoveReasonCode.EMPTY_SOURCE).toBe('empty_source');
    expect(MoveReasonCode.SAME_POINT).toBe('same_point');
  });
});
