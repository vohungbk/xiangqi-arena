import { describe, expect, it } from 'vitest';
import { getInitials } from './initials';

describe('getInitials', () => {
  it('should use the first letter of two words', () => {
    expect(getInitials('minh_anh')).toBe('MA');
    expect(getInitials('Minh Anh')).toBe('MA');
  });

  it('should use the first two letters of one word', () => {
    expect(getInitials('khoa')).toBe('KH');
  });

  it('should give a single letter for a one-letter name', () => {
    expect(getInitials('a')).toBe('A');
  });

  it('should give a question mark for an empty name', () => {
    expect(getInitials('')).toBe('?');
  });
});
