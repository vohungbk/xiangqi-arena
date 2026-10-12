import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseFen, PieceType, Side, START_FEN } from '@xiangqi/shared-types';
import { countPieces } from './pieces';

const SOURCE_DIRS = [__dirname, join(__dirname, '../../shared-types/src')];

describe('countPieces', () => {
  const { board } = parseFen(START_FEN);

  it('should give each side all 7 piece types at the start', () => {
    for (const side of [Side.RED, Side.BLACK]) {
      const counts = countPieces(board, side);
      expect(Object.keys(counts).sort()).toEqual(Object.values(PieceType).sort());
      for (const type of Object.values(PieceType)) expect(counts[type]).toBeGreaterThan(0);
    }
  });

  it('should count 1 General, 2 of each pair and 5 Soldiers for each side', () => {
    const expected = {
      [PieceType.GENERAL]: 1,
      [PieceType.ADVISOR]: 2,
      [PieceType.ELEPHANT]: 2,
      [PieceType.HORSE]: 2,
      [PieceType.CHARIOT]: 2,
      [PieceType.CANNON]: 2,
      [PieceType.SOLDIER]: 5,
    };
    expect(countPieces(board, Side.RED)).toEqual(expected);
    expect(countPieces(board, Side.BLACK)).toEqual(expected);
  });

  it('should give 16 pieces to each side and 32 in total', () => {
    const total = (side: Side) =>
      Object.values(countPieces(board, side)).reduce((sum, n) => sum + n, 0);
    expect(total(Side.RED)).toBe(16);
    expect(total(Side.BLACK)).toBe(16);
  });

  it('should give 0 for a type a side no longer has', () => {
    const lone = parseFen('4k4/9/9/9/9/9/9/9/9/4K4 w - - 0 1').board;
    expect(countPieces(lone, Side.RED)[PieceType.CHARIOT]).toBe(0);
    expect(countPieces(lone, Side.RED)[PieceType.GENERAL]).toBe(1);
  });
});

describe('side names in the code', () => {
  it('should not use the name White in the source of shared-types and the engine', () => {
    const files = SOURCE_DIRS.flatMap((dir) =>
      readdirSync(dir)
        .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))
        .map((name) => join(dir, name)),
    );
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/\bwhite\b/i);
    }
  });
});
