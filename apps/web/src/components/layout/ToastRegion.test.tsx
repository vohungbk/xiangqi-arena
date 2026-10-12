// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_TOASTS, useShellStore } from '@/store/useShellStore';
import { TOAST_DURATION_MS, ToastRegion } from './ToastRegion';

function push(message: string) {
  act(() => useShellStore.getState().pushToast(message));
}

describe('ToastRegion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useShellStore.setState({ toasts: [] });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('should show nothing while there is no notification', () => {
    render(<ToastRegion />);
    expect(screen.queryAllByTestId('toast')).toHaveLength(0);
  });

  it('should show a small toast when a notification arrives', () => {
    render(<ToastRegion />);
    push('Bạn có lời mời kết bạn mới');
    expect(screen.getByText('Bạn có lời mời kết bạn mới')).toBeTruthy();
  });

  it('should announce the toast politely and not take the focus', () => {
    render(<ToastRegion />);
    push('Thông báo');
    const region = screen.getByRole('status');
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(document.activeElement).toBe(document.body);
  });

  it('should let the pointer through around the toasts so the board stays usable', () => {
    render(<ToastRegion />);
    push('Thông báo');
    expect(screen.getByRole('status').className).toContain('pointer-events-none');
    expect(screen.getByTestId('toast').className).toContain('pointer-events-auto');
  });

  it('should show two toasts when two notifications arrive within 2 seconds', () => {
    render(<ToastRegion />);
    push('Thông báo 1');
    act(() => vi.advanceTimersByTime(1500));
    push('Thông báo 2');
    expect(screen.getAllByTestId('toast').map((item) => item.textContent)).toEqual([
      'Thông báo 1',
      'Thông báo 2',
    ]);
  });

  it('should sit under the in-game bar so it does not cover Rời Đi', () => {
    render(<ToastRegion />);
    expect(screen.getByRole('status').className).toContain('top-20');
  });

  it('should remove a toast after its time', () => {
    render(<ToastRegion />);
    push('Thông báo');
    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS));
    expect(screen.queryByText('Thông báo')).toBeNull();
  });

  it('should keep only the newest toasts when too many arrive', () => {
    render(<ToastRegion />);
    for (let i = 1; i <= MAX_TOASTS + 2; i++) push(`Thông báo ${i}`);
    const items = screen.getAllByTestId('toast');
    expect(items).toHaveLength(MAX_TOASTS);
    expect(items.at(-1)?.textContent).toBe(`Thông báo ${MAX_TOASTS + 2}`);
    expect(screen.queryByText('Thông báo 1')).toBeNull();
  });

  it('should show the message as plain text and not as HTML', () => {
    render(<ToastRegion />);
    push('<img src=x onerror=alert(1)>');
    expect(screen.getByTestId('toast').querySelector('img')).toBeNull();
    expect(screen.getByTestId('toast').textContent).toBe('<img src=x onerror=alert(1)>');
  });
});
