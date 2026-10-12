import { describe, expect, it } from 'vitest';
import { BoardError, BoardErrorCode } from './board';
import {
  fenCharToPiece,
  parsePieceType,
  parseSide,
  PieceType,
  pieceToFenChar,
  Side,
} from './pieces';

function codeOf(run: () => unknown): BoardErrorCode | undefined {
  try {
    run();
  } catch (error) {
    if (error instanceof BoardError) return error.code;
    throw error;
  }
  return undefined;
}

describe('Side', () => {
  it('should list the sides Red and Black and not White', () => {
    expect(Object.values(Side)).toEqual(['RED', 'BLACK']);
    expect(Object.values(Side)).not.toContain('WHITE');
  });
});

describe('PieceType', () => {
  it('should list the 7 piece types', () => {
    expect(Object.values(PieceType).sort()).toEqual(
      ['ADVISOR', 'CANNON', 'CHARIOT', 'ELEPHANT', 'GENERAL', 'HORSE', 'SOLDIER'].sort(),
    );
  });
});

describe('parseSide', () => {
  it('should accept RED and BLACK', () => {
    expect(parseSide('RED')).toBe(Side.RED);
    expect(parseSide('BLACK')).toBe(Side.BLACK);
  });

  it('should refuse White, white, red, an empty string, null and a number', () => {
    for (const value of ['WHITE', 'White', 'white', 'red', 'Red', '', null, undefined, 1, {}]) {
      expect(codeOf(() => parseSide(value))).toBe(BoardErrorCode.INVALID_SIDE);
    }
  });
});

describe('parsePieceType', () => {
  it('should accept all 7 piece types', () => {
    for (const type of Object.values(PieceType)) expect(parsePieceType(type)).toBe(type);
  });

  it('should refuse Queen, KING, an empty string, null and a number', () => {
    for (const value of ['QUEEN', 'Queen', 'KING', 'General', '', null, undefined, 3]) {
      expect(codeOf(() => parsePieceType(value))).toBe(BoardErrorCode.INVALID_PIECE_TYPE);
    }
  });
});

describe('fenCharToPiece and pieceToFenChar', () => {
  it('should map an upper case letter to Red and a lower case letter to Black', () => {
    expect(fenCharToPiece('K')).toEqual({ type: PieceType.GENERAL, side: Side.RED });
    expect(fenCharToPiece('k')).toEqual({ type: PieceType.GENERAL, side: Side.BLACK });
    expect(fenCharToPiece('P')).toEqual({ type: PieceType.SOLDIER, side: Side.RED });
    expect(fenCharToPiece('c')).toEqual({ type: PieceType.CANNON, side: Side.BLACK });
  });

  it('should give the same piece after letter and back for all 14 pieces', () => {
    for (const side of Object.values(Side)) {
      for (const type of Object.values(PieceType)) {
        const piece = { type, side };
        expect(fenCharToPiece(pieceToFenChar(piece))).toEqual(piece);
      }
    }
  });

  it('should use 7 different letters for the 7 types', () => {
    const letters = Object.values(PieceType).map((type) =>
      pieceToFenChar({ type, side: Side.BLACK }),
    );
    expect(new Set(letters).size).toBe(7);
  });

  it('should refuse a letter that is not one of rnbakcp', () => {
    for (const char of ['x', 'q', '1', '', 'rn', ' ']) {
      expect(codeOf(() => fenCharToPiece(char))).toBe(BoardErrorCode.INVALID_PIECE_CHAR);
    }
  });
});
