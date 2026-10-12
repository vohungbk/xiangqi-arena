// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeHeaderUser } from '@/lib/header-user.fixture';
import {
  findRemovedLabels,
  findRemovedPaths,
  REMOVED_VIEWER_PATTERN,
} from '@/lib/removed-items.fixture';
import { useSessionStore } from '@/store/useSessionStore';
import { useShellStore } from '@/store/useShellStore';
import { AppHeader } from './AppHeader';
import { BannerSlot } from './BannerSlot';
import { BottomNav } from './BottomNav';
import { CategoryDrawer } from './CategoryDrawer';
import { CompactHeader } from './CompactHeader';
import { InGameBar } from './InGameBar';
import { SideNav } from './SideNav';

vi.mock('next/navigation', () => ({ usePathname: () => '/play' }));

function Shell() {
  return (
    <>
      <AppHeader />
      <CompactHeader />
      <InGameBar />
      <BannerSlot />
      <SideNav />
      <BottomNav />
      <CategoryDrawer />
    </>
  );
}

/** Text, accessible names and link targets of everything on the screen. */
function screenContent(): { text: string; hrefs: string[] } {
  const body = document.body;
  const names = [...body.querySelectorAll('[aria-label], [title], [alt]')].flatMap((element) =>
    ['aria-label', 'title', 'alt'].map((attribute) => element.getAttribute(attribute) ?? ''),
  );
  const hrefs = [...body.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? '');
  return { text: `${body.textContent ?? ''} ${names.join(' ')}`, hrefs };
}

function expectNoRemovedItem() {
  const { text, hrefs } = screenContent();
  expect(findRemovedLabels(text)).toEqual([]);
  expect(text).not.toMatch(REMOVED_VIEWER_PATTERN);
  expect(findRemovedPaths(hrefs)).toEqual([]);
}

describe('shell without the removed items', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null });
    useShellStore.setState({ inGame: false, drawerOpen: true, loginModalOpen: false });
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      })),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('should show no removed item in any menu for a Guest', () => {
    render(<Shell />);
    expectNoRemovedItem();
  });

  it('should show no removed item in any menu for a logged-in player', () => {
    useSessionStore.setState({ user: makeHeaderUser() });
    render(<Shell />);
    expectNoRemovedItem();
  });

  it('should show no viewer counter on the in-game shell', () => {
    useShellStore.setState({ inGame: true, drawerOpen: false });
    render(<Shell />);
    expectNoRemovedItem();
  });
});
