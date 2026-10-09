import { describe, expect, it } from 'vitest';
import { isOriginAllowed } from './auth.util';

describe('isOriginAllowed', () => {
  const allowed = ['http://localhost:3000'];
  it('should accept an origin in the allow list', () => {
    expect(isOriginAllowed('http://localhost:3000', allowed)).toBe(true);
  });
  it('should reject an unknown origin', () => {
    expect(isOriginAllowed('https://evil.example', allowed)).toBe(false);
  });
  it('should reject a missing origin header', () => {
    expect(isOriginAllowed(undefined, allowed)).toBe(false);
  });
});
