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
import { checkAdvisorMove, checkGeneralMove } from './piece-rules';
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

describe('checkGeneralMove', () => {
  const general = (x: number, y: number) => positionWith(piece(PieceType.GENERAL, Side.RED, x, y));

  it('should accept 1 step along a file or a rank inside the Palace', () => {
    expect(checkGeneralMove(general(4, 9), move({ x: 4, y: 9 }, { x: 4, y: 8 }))).toBeNull();
    expect(checkGeneralMove(general(4, 8), move({ x: 4, y: 8 }, { x: 3, y: 8 }))).toBeNull();
    expect(checkGeneralMove(general(4, 8), move({ x: 4, y: 8 }, { x: 5, y: 8 }))).toBeNull();
    expect(checkGeneralMove(general(4, 8), move({ x: 4, y: 8 }, { x: 4, y: 9 }))).toBeNull();
  });

  it('should accept a capture by the same step', () => {
    const position = positionWith(
      piece(PieceType.GENERAL, Side.RED, 4, 8),
      piece(PieceType.SOLDIER, Side.BLACK, 4, 7),
    );
    expect(checkGeneralMove(position, move({ x: 4, y: 8 }, { x: 4, y: 7 }))).toBeNull();
  });

  it('should reject 2 steps', () => {
    expect(checkGeneralMove(general(4, 9), move({ x: 4, y: 9 }, { x: 4, y: 7 }))).toBe(ILLEGAL);
  });

  it('should reject a diagonal step', () => {
    expect(checkGeneralMove(general(4, 9), move({ x: 4, y: 9 }, { x: 3, y: 8 }))).toBe(ILLEGAL);
  });

  it('should reject a step out of the Palace', () => {
    expect(checkGeneralMove(general(3, 9), move({ x: 3, y: 9 }, { x: 2, y: 9 }))).toBe(ILLEGAL);
    expect(checkGeneralMove(general(4, 7), move({ x: 4, y: 7 }, { x: 4, y: 6 }))).toBe(ILLEGAL);
    expect(checkGeneralMove(general(5, 8), move({ x: 5, y: 8 }, { x: 6, y: 8 }))).toBe(ILLEGAL);
  });

  it('should reject a step that stays in place', () => {
    expect(checkGeneralMove(general(4, 9), move({ x: 4, y: 9 }, { x: 4, y: 9 }))).toBe(ILLEGAL);
  });
});

describe('checkAdvisorMove', () => {
  const advisor = (x: number, y: number) => positionWith(piece(PieceType.ADVISOR, Side.RED, x, y));

  it('should accept 1 diagonal step inside the Palace', () => {
    expect(checkAdvisorMove(advisor(3, 9), move({ x: 3, y: 9 }, { x: 4, y: 8 }))).toBeNull();
  });

  it('should accept the 4 diagonal steps from the centre of the Palace', () => {
    for (const to of [
      { x: 3, y: 7 },
      { x: 5, y: 7 },
      { x: 3, y: 9 },
      { x: 5, y: 9 },
    ]) {
      expect(checkAdvisorMove(advisor(4, 8), move({ x: 4, y: 8 }, to))).toBeNull();
    }
  });

  it('should reject a step along a file or a rank', () => {
    expect(checkAdvisorMove(advisor(4, 8), move({ x: 4, y: 8 }, { x: 4, y: 9 }))).toBe(ILLEGAL);
    expect(checkAdvisorMove(advisor(4, 8), move({ x: 4, y: 8 }, { x: 3, y: 8 }))).toBe(ILLEGAL);
  });

  it('should reject 2 steps on a diagonal', () => {
    expect(checkAdvisorMove(advisor(3, 9), move({ x: 3, y: 9 }, { x: 5, y: 7 }))).toBe(ILLEGAL);
  });

  it('should reject a step out of the Palace', () => {
    expect(checkAdvisorMove(advisor(3, 7), move({ x: 3, y: 7 }, { x: 2, y: 6 }))).toBe(ILLEGAL);
    expect(checkAdvisorMove(advisor(5, 9), move({ x: 5, y: 9 }, { x: 6, y: 8 }))).toBe(ILLEGAL);
  });
});

describe('the Palace of each side', () => {
  it('should use the Palace of Black (y 0 to 2) for a Black General', () => {
    const black = (x: number, y: number) =>
      positionWith(piece(PieceType.GENERAL, Side.BLACK, x, y));
    expect(checkGeneralMove(black(4, 0), move({ x: 4, y: 0 }, { x: 4, y: 1 }))).toBeNull();
    expect(checkGeneralMove(black(4, 2), move({ x: 4, y: 2 }, { x: 4, y: 3 }))).toBe(ILLEGAL);
  });

  it('should use the Palace of Black for a Black Advisor', () => {
    const black = (x: number, y: number) =>
      positionWith(piece(PieceType.ADVISOR, Side.BLACK, x, y));
    expect(checkAdvisorMove(black(3, 0), move({ x: 3, y: 0 }, { x: 4, y: 1 }))).toBeNull();
    expect(checkAdvisorMove(black(3, 2), move({ x: 3, y: 2 }, { x: 2, y: 3 }))).toBe(ILLEGAL);
  });

  it('should not let a Red piece enter the Palace of Black or a Black piece enter the Red one', () => {
    const redGeneral = positionWith(piece(PieceType.GENERAL, Side.RED, 4, 7));
    expect(checkGeneralMove(redGeneral, move({ x: 4, y: 7 }, { x: 4, y: 6 }))).toBe(ILLEGAL);
    const blackAdvisor = positionWith(piece(PieceType.ADVISOR, Side.BLACK, 3, 2));
    expect(checkAdvisorMove(blackAdvisor, move({ x: 3, y: 2 }, { x: 4, y: 3 }))).toBe(ILLEGAL);
  });

  it('should use the Palace of the side of the piece and not the side to move', () => {
    const position = createPosition({
      pieces: [piece(PieceType.GENERAL, Side.BLACK, 4, 0)],
      turn: Side.RED,
    });
    expect(checkGeneralMove(position, move({ x: 4, y: 0 }, { x: 4, y: 1 }))).toBeNull();
  });
});

describe('the rules of the General and the Advisor', () => {
  const start = createStartingPosition();

  it('should return null for a piece that is not a General or an Advisor', () => {
    const chariot = move({ x: 0, y: 9 }, { x: 5, y: 5 });
    expect(checkGeneralMove(start, chariot)).toBeNull();
    expect(checkAdvisorMove(start, chariot)).toBeNull();
  });

  it('should not apply the rule of the General to an Advisor and the reverse', () => {
    const advisorStep = move({ x: 3, y: 9 }, { x: 4, y: 8 });
    expect(checkGeneralMove(start, advisorStep)).toBeNull();
    expect(checkAdvisorMove(start, advisorStep)).toBeNull();
    const generalStep = move({ x: 4, y: 9 }, { x: 4, y: 8 });
    expect(checkAdvisorMove(start, generalStep)).toBeNull();
    expect(checkGeneralMove(start, generalStep)).toBeNull();
  });

  it('should return null and not throw for an empty source or a point outside the board', () => {
    const cases: Move[] = [
      move({ x: 4, y: 4 }, { x: 4, y: 5 }),
      move({ x: 9, y: 9 }, { x: 4, y: 5 }),
      move({ x: 4, y: 9 }, { x: 4, y: 10 }),
      move({ x: 3, y: 9 }, { x: -1, y: 8 }),
    ];
    for (const item of cases) {
      expect(checkGeneralMove(start, item)).toBeNull();
      expect(checkAdvisorMove(start, item)).toBeNull();
    }
  });

  it('should not change the position and give the same result twice', () => {
    const before = positionToFen(start);
    const items: Move[] = [
      move({ x: 4, y: 9 }, { x: 4, y: 8 }),
      move({ x: 4, y: 9 }, { x: 4, y: 7 }),
      move({ x: 3, y: 9 }, { x: 4, y: 8 }),
      move({ x: 3, y: 9 }, { x: 3, y: 8 }),
    ];
    for (const item of items) {
      expect(checkGeneralMove(start, item)).toBe(checkGeneralMove(start, item));
      expect(checkAdvisorMove(start, item)).toBe(checkAdvisorMove(start, item));
    }
    expect(positionToFen(start)).toBe(before);
  });

  it('should use the code illegal_pattern as in the spec list', () => {
    expect(MoveReasonCode.ILLEGAL_PATTERN).toBe('illegal_pattern');
  });
});
