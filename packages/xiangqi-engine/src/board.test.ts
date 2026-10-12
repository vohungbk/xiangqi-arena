import { describe, expect, it } from 'vitest';
import { BoardError, BoardErrorCode, parseFen, START_FEN } from '@xiangqi/shared-types';
import { pieceAt } from './board';

describe('pieceAt', () => {
  const { board } = parseFen(START_FEN);

  it('should read the Black king at (4, 0) and the Red king at (4, 9)', () => {
    expect(pieceAt(board, { x: 4, y: 0 })).toBe('k');
    expect(pieceAt(board, { x: 4, y: 9 })).toBe('K');
  });

  it('should read the corner points of the board', () => {
    expect(pieceAt(board, { x: 0, y: 0 })).toBe('r');
    expect(pieceAt(board, { x: 8, y: 9 })).toBe('R');
  });

  it('should return an empty string for an empty point', () => {
    expect(pieceAt(board, { x: 4, y: 4 })).toBe('');
  });

  it('should throw a BoardError and not return a piece for a point outside the board', () => {
    for (const point of [
      { x: -1, y: 0 },
      { x: 9, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 10 },
    ]) {
      expect(() => pieceAt(board, point)).toThrow(BoardError);
      try {
        pieceAt(board, point);
      } catch (error) {
        expect((error as BoardError).code).toBe(BoardErrorCode.POINT_OUT_OF_BOARD);
      }
    }
  });
});
