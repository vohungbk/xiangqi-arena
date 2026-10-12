// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { pushToast } from '@/lib/toast';
import { Toaster } from './sonner';

function push(message: string) {
  act(() => pushToast(message));
}

describe('Toaster and pushToast', () => {
  beforeEach(() => {
    window.matchMedia ??= (() => ({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    act(() => {
      toast.dismiss();
    });
    cleanup();
  });

  it('should show nothing while there is no notification', () => {
    render(<Toaster />);
    expect(screen.queryByText('Thông báo')).toBeNull();
  });

  it('should show a small toast when a notification arrives', async () => {
    render(<Toaster />);
    push('Bạn có lời mời kết bạn mới');
    expect(await screen.findByText('Bạn có lời mời kết bạn mới')).toBeTruthy();
  });

  it('should show two toasts when two notifications arrive within 2 seconds', async () => {
    render(<Toaster />);
    push('Thông báo 1');
    push('Thông báo 2');
    expect(await screen.findByText('Thông báo 1')).toBeTruthy();
    expect(await screen.findByText('Thông báo 2')).toBeTruthy();
  });

  it('should keep at most three toasts visible when many arrive', async () => {
    render(<Toaster />);
    for (let i = 1; i <= 5; i++) push(`Thông báo ${i}`);
    await screen.findByText('Thông báo 5');
    await waitFor(() => {
      const visible = document.querySelectorAll('[data-sonner-toast][data-visible="true"]');
      expect(visible).toHaveLength(3);
    });
  });

  it('should show the message as plain text and not as HTML', async () => {
    render(<Toaster />);
    push('<img src=x onerror=alert(1)>');
    const item = await screen.findByText('<img src=x onerror=alert(1)>');
    expect(item.querySelector('img')).toBeNull();
    expect(document.querySelector('[data-sonner-toast] img')).toBeNull();
  });

  it('should sit at the top right, under the in-game bar', async () => {
    render(<Toaster />);
    push('Thông báo');
    await screen.findByText('Thông báo');
    const list = document.querySelector('[data-sonner-toaster]') as HTMLElement;
    expect(list.getAttribute('data-y-position')).toBe('top');
    expect(list.getAttribute('data-x-position')).toBe('right');
    // The offset is 80 px, which is below the 69 px high bar, so [Rời Đi] stays free.
    expect(list.style.getPropertyValue('--offset-top')).toBe('80px');
  });
});
