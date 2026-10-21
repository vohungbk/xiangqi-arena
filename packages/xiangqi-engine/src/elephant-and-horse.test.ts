import { describe, expect, it } from 'vitest';
import {
  MoveReasonCode,
  PieceType,
  Side,
  type Move,
  type PlacedPiece,
  type Point,
  type Position,
} from '@xiangqi/shared-types';
import { checkElephantMove, checkHorseMove } from './piece-rules';
import { createPosition, createStartingPosition, positionToFen } from './position';

function piece(type: PieceType, side: Side, x: number, y: number): PlacedPiece {
  return { type, side, point: { x, y } };
}

/** A position with only the given pieces. */
function positionWith(...pieces: PlacedPiece[]): Position {
  return createPosition({ pieces, turn: Side.RED });
}

function move(from: Point, to: Point): Move {
  return { from, to };
}

const ILLEGAL = MoveReasonCode.ILLEGAL_PATTERN;

describe('checkElephantMove', () => {
  const elephant = (x: number, y: number, side = Side.RED, ...others: PlacedPiece[]) =>
    positionWith(piece(PieceType.ELEPHANT, side, x, y), ...others);

  it('should accept 2 steps on a diagonal with an empty eye', () => {
    expect(checkElephantMove(elephant(2, 9), move({ x: 2, y: 9 }, { x: 4, y: 7 }))).toBeNull();
    expect(checkElephantMove(elephant(2, 9), move({ x: 2, y: 9 }, { x: 0, y: 7 }))).toBeNull();
  });

  it('should accept the 4 diagonal moves from the middle of its own half', () => {
    const position = elephant(4, 7);
    for (const to of [
      { x: 2, y: 9 },
      { x: 6, y: 9 },
      { x: 2, y: 5 },
      { x: 6, y: 5 },
    ]) {
      expect(checkElephantMove(position, move({ x: 4, y: 7 }, to))).toBeNull();
    }
  });

  it('should accept a capture by the same step', () => {
    const position = elephant(2, 9, Side.RED, piece(PieceType.SOLDIER, Side.BLACK, 4, 7));
    expect(checkElephantMove(position, move({ x: 2, y: 9 }, { x: 4, y: 7 }))).toBeNull();
  });

  it('should reject a Red Elephant that crosses the River to y 4 and accept y 5', () => {
    const position = elephant(4, 7);
    expect(checkElephantMove(position, move({ x: 4, y: 7 }, { x: 6, y: 5 }))).toBeNull();
    const onBank = elephant(4, 5);
    expect(checkElephantMove(onBank, move({ x: 4, y: 5 }, { x: 6, y: 3 }))).toBe(ILLEGAL);
    expect(checkElephantMove(onBank, move({ x: 4, y: 5 }, { x: 2, y: 3 }))).toBe(ILLEGAL);
  });

  it('should reject a Black Elephant that crosses the River to y 5 and accept y 4', () => {
    const position = elephant(4, 2, Side.BLACK);
    expect(checkElephantMove(position, move({ x: 4, y: 2 }, { x: 6, y: 4 }))).toBeNull();
    const onBank = elephant(4, 4, Side.BLACK);
    expect(checkElephantMove(onBank, move({ x: 4, y: 4 }, { x: 6, y: 6 }))).toBe(ILLEGAL);
  });

  it('should reject a move when a piece of either colour is on the eye', () => {
    for (const side of [Side.RED, Side.BLACK]) {
      const position = elephant(2, 9, Side.RED, piece(PieceType.SOLDIER, side, 3, 8));
      expect(checkElephantMove(position, move({ x: 2, y: 9 }, { x: 4, y: 7 }))).toBe(ILLEGAL);
    }
  });

  it('should not be blocked by a piece next to the eye', () => {
    const position = elephant(2, 9, Side.RED, piece(PieceType.SOLDIER, Side.RED, 3, 9));
    expect(checkElephantMove(position, move({ x: 2, y: 9 }, { x: 4, y: 7 }))).toBeNull();
  });

  it('should reject a step along a file or a rank, 1 step diagonal and 3 steps diagonal', () => {
    const position = elephant(4, 7);
    expect(checkElephantMove(position, move({ x: 4, y: 7 }, { x: 4, y: 5 }))).toBe(ILLEGAL);
    expect(checkElephantMove(position, move({ x: 4, y: 7 }, { x: 6, y: 7 }))).toBe(ILLEGAL);
    expect(checkElephantMove(position, move({ x: 4, y: 7 }, { x: 5, y: 8 }))).toBe(ILLEGAL);
    expect(checkElephantMove(position, move({ x: 4, y: 7 }, { x: 1, y: 4 }))).toBe(ILLEGAL);
  });

  it('should reject a step that stays in place', () => {
    expect(checkElephantMove(elephant(4, 7), move({ x: 4, y: 7 }, { x: 4, y: 7 }))).toBe(ILLEGAL);
  });
});

describe('checkHorseMove', () => {
  const horse = (x: number, y: number, side = Side.RED, ...others: PlacedPiece[]) =>
    positionWith(piece(PieceType.HORSE, side, x, y), ...others);

  it('should accept the L move with an empty leg', () => {
    expect(checkHorseMove(horse(1, 9), move({ x: 1, y: 9 }, { x: 2, y: 7 }))).toBeNull();
    expect(checkHorseMove(horse(1, 9), move({ x: 1, y: 9 }, { x: 3, y: 8 }))).toBeNull();
  });

  it('should accept all 8 L moves from the middle of the board', () => {
    const position = horse(4, 5);
    const targets: Point[] = [
      { x: 2, y: 4 },
      { x: 2, y: 6 },
      { x: 6, y: 4 },
      { x: 6, y: 6 },
      { x: 3, y: 3 },
      { x: 5, y: 3 },
      { x: 3, y: 7 },
      { x: 5, y: 7 },
    ];
    for (const to of targets) {
      expect(checkHorseMove(position, move({ x: 4, y: 5 }, to))).toBeNull();
    }
  });

  it('should accept a capture by the same step', () => {
    const position = horse(1, 9, Side.RED, piece(PieceType.SOLDIER, Side.BLACK, 2, 7));
    expect(checkHorseMove(position, move({ x: 1, y: 9 }, { x: 2, y: 7 }))).toBeNull();
  });

  it('should reject a move when a piece of either colour is on the leg', () => {
    for (const side of [Side.RED, Side.BLACK]) {
      const position = horse(1, 9, Side.RED, piece(PieceType.SOLDIER, side, 1, 8));
      expect(checkHorseMove(position, move({ x: 1, y: 9 }, { x: 2, y: 7 }))).toBe(ILLEGAL);
    }
  });

  it('should use the leg of the long side for a move along a rank', () => {
    const blocked = horse(4, 5, Side.RED, piece(PieceType.SOLDIER, Side.RED, 5, 5));
    expect(checkHorseMove(blocked, move({ x: 4, y: 5 }, { x: 6, y: 4 }))).toBe(ILLEGAL);
    expect(checkHorseMove(blocked, move({ x: 4, y: 5 }, { x: 6, y: 6 }))).toBe(ILLEGAL);
    expect(checkHorseMove(blocked, move({ x: 4, y: 5 }, { x: 2, y: 4 }))).toBeNull();
  });

  it('should not be blocked by a piece next to the leg', () => {
    const position = horse(1, 9, Side.RED, piece(PieceType.SOLDIER, Side.RED, 2, 8));
    expect(checkHorseMove(position, move({ x: 1, y: 9 }, { x: 2, y: 7 }))).toBeNull();
  });

  it('should reject a step along a file or a rank, a diagonal step and 3 steps', () => {
    const position = horse(4, 5);
    expect(checkHorseMove(position, move({ x: 4, y: 5 }, { x: 4, y: 4 }))).toBe(ILLEGAL);
    expect(checkHorseMove(position, move({ x: 4, y: 5 }, { x: 4, y: 3 }))).toBe(ILLEGAL);
    expect(checkHorseMove(position, move({ x: 4, y: 5 }, { x: 5, y: 4 }))).toBe(ILLEGAL);
    expect(checkHorseMove(position, move({ x: 4, y: 5 }, { x: 6, y: 7 }))).toBe(ILLEGAL);
    expect(checkHorseMove(position, move({ x: 4, y: 5 }, { x: 7, y: 6 }))).toBe(ILLEGAL);
  });

  it('should reject a step that stays in place', () => {
    expect(checkHorseMove(horse(4, 5), move({ x: 4, y: 5 }, { x: 4, y: 5 }))).toBe(ILLEGAL);
  });
});

describe('the rules of the Elephant and the Horse', () => {
  it('should return null for a piece that is not an Elephant or a Horse', () => {
    const position = positionWith(piece(PieceType.CHARIOT, Side.RED, 2, 9));
    expect(checkElephantMove(position, move({ x: 2, y: 9 }, { x: 4, y: 7 }))).toBeNull();
    expect(checkHorseMove(position, move({ x: 2, y: 9 }, { x: 3, y: 7 }))).toBeNull();
  });

  it('should not apply the rule of the Elephant to a Horse and the reverse', () => {
    const horse = positionWith(piece(PieceType.HORSE, Side.RED, 2, 9));
    const elephant = positionWith(piece(PieceType.ELEPHANT, Side.RED, 2, 9));
    expect(checkElephantMove(horse, move({ x: 2, y: 9 }, { x: 2, y: 8 }))).toBeNull();
    expect(checkHorseMove(elephant, move({ x: 2, y: 9 }, { x: 4, y: 7 }))).toBeNull();
  });

  it('should return null and not throw for an empty source or a point outside the board', () => {
    const position = positionWith(piece(PieceType.ELEPHANT, Side.RED, 2, 9));
    const empty = createStartingPosition();
    expect(checkElephantMove(empty, move({ x: 4, y: 5 }, { x: 6, y: 7 }))).toBeNull();
    expect(checkHorseMove(empty, move({ x: 4, y: 5 }, { x: 5, y: 7 }))).toBeNull();
    expect(checkElephantMove(position, move({ x: 2, y: 9 }, { x: 4, y: 11 }))).toBeNull();
    expect(checkElephantMove(position, move({ x: -1, y: 9 }, { x: 1, y: 7 }))).toBeNull();
    const horse = positionWith(piece(PieceType.HORSE, Side.RED, 1, 9));
    expect(checkHorseMove(horse, move({ x: 1, y: 9 }, { x: 2, y: 11 }))).toBeNull();
  });

  it('should not change the position and give the same result twice', () => {
    const position = createStartingPosition();
    const before = positionToFen(position);
    const elephantMove = move({ x: 2, y: 9 }, { x: 4, y: 7 });
    const horseMove = move({ x: 1, y: 9 }, { x: 2, y: 7 });
    expect(checkElephantMove(position, elephantMove)).toBe(
      checkElephantMove(position, elephantMove),
    );
    expect(checkHorseMove(position, horseMove)).toBe(checkHorseMove(position, horseMove));
    expect(positionToFen(position)).toBe(before);
  });

  it('should accept the free Elephant and Horse moves and reject the Horse move blocked by the Elephant in the starting position', () => {
    const position = createStartingPosition();
    expect(checkElephantMove(position, move({ x: 2, y: 9 }, { x: 4, y: 7 }))).toBeNull();
    expect(checkHorseMove(position, move({ x: 1, y: 9 }, { x: 2, y: 7 }))).toBeNull();
    expect(checkHorseMove(position, move({ x: 1, y: 9 }, { x: 3, y: 8 }))).toBe(ILLEGAL);
  });

  it('should use the code illegal_pattern as in the spec list', () => {
    expect(ILLEGAL).toBe('illegal_pattern');
  });
});
