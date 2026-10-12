// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  REMOVED_HOME_BLOCK,
  REMOVED_STREAK_PATTERN,
  REMOVED_VIEWER_PATTERN,
} from '@/lib/removed-items.fixture';
import HomePage from './page';

describe('HomePage', () => {
  let text = '';

  beforeEach(() => {
    text = render(<HomePage />).container.textContent ?? '';
  });

  afterEach(() => {
    cleanup();
  });

  it('should show no block Cờ Thế Mỗi Ngày', () => {
    expect(text).not.toContain(REMOVED_HOME_BLOCK);
  });

  it('should show no card for the 7-day streak', () => {
    expect(text).not.toMatch(REMOVED_STREAK_PATTERN);
  });

  it('should show no viewer counter', () => {
    expect(text).not.toMatch(REMOVED_VIEWER_PATTERN);
  });
});
