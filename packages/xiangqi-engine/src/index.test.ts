import { describe, expect, it } from 'vitest';
import { START_FEN } from '@xiangqi/shared-types';
import { isStartPosition } from './index';

describe('isStartPosition', () => {
  it('should return true for the standard start FEN', () => {
    expect(isStartPosition(START_FEN)).toBe(true);
  });

  it('should return true when the FEN has surrounding spaces', () => {
    expect(isStartPosition(`  ${START_FEN}\n`)).toBe(true);
  });

  it('should return false for a different position', () => {
    expect(isStartPosition('4k4/9/9/9/9/9/9/9/9/4K4 w - - 0 1')).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(isStartPosition('')).toBe(false);
  });
});
