// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { OnlineBadge } from './OnlineBadge';

describe('OnlineBadge', () => {
  afterEach(() => {
    cleanup();
  });

  it('should show the number with a comma as thousands separator', () => {
    render(<OnlineBadge count={1240} />);
    expect(screen.getByText('1,240')).toBeTruthy();
  });

  it('should give the number a text label for assistive tools', () => {
    render(<OnlineBadge count={80} />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('80 người chơi đang online');
  });

  it('should be hidden, not shown as 0, when the number is not available', () => {
    const { container } = render(<OnlineBadge count={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('should show 0 when the server says that no one is online', () => {
    render(<OnlineBadge count={0} />);
    expect(screen.getByText('0')).toBeTruthy();
  });

  it.each([Number.NaN, -3, 12.5])('should be hidden when the number is %s', (count) => {
    const { container } = render(<OnlineBadge count={count} />);
    expect(container.innerHTML).toBe('');
  });
});
