// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeHeaderUser } from '@/lib/header-user.fixture';
import { useSessionStore } from '@/store/useSessionStore';
import HomePage from '@/app/page';
import { HomeLayout } from './HomeLayout';

const SLOT_NAME = 'Top 5 Bảng xếp hạng';

describe('HomeLayout', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('should show the Home page with the title Tổng quan and the widget place', () => {
    render(<HomeLayout />);
    expect(screen.getByRole('heading', { level: 1, name: 'Tổng quan' })).not.toBeNull();
    expect(screen.getByRole('region', { name: SLOT_NAME })).not.toBeNull();
  });

  it('should show the page and the widget place for a Guest', () => {
    render(<HomePage />);
    expect(screen.getByRole('main')).not.toBeNull();
    expect(screen.getByRole('region', { name: SLOT_NAME })).not.toBeNull();
  });

  it('should show the page and the widget place for a logged-in player', () => {
    useSessionStore.setState({ user: makeHeaderUser() });
    render(<HomePage />);
    expect(screen.getByRole('main')).not.toBeNull();
    expect(screen.getByRole('region', { name: SLOT_NAME })).not.toBeNull();
  });

  it('should show an empty state in the widget place when no widget is plugged in', () => {
    render(<HomeLayout />);
    const slot = screen.getByRole('region', { name: SLOT_NAME });
    expect(slot.textContent).toContain('Bảng xếp hạng sẽ hiển thị ở đây.');
  });

  it('should show the widget of LB-F01 in the place instead of the empty state', () => {
    render(
      <HomeLayout
        topFive={
          <ol>
            <li>1. minh_anh</li>
          </ol>
        }
      />,
    );
    const slot = screen.getByRole('region', { name: SLOT_NAME });
    expect(slot.textContent).toContain('1. minh_anh');
    expect(slot.textContent).not.toContain('Bảng xếp hạng sẽ hiển thị ở đây.');
  });

  it('should render the widget place without calling any API', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<HomeLayout />);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
