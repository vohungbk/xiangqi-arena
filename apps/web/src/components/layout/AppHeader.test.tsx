import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NAV_ITEMS } from '@/lib/nav-items';
import { AppHeader } from './AppHeader';

const pathname = vi.hoisted(() => ({ current: '/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => pathname.current,
}));

function render(path: string): string {
  pathname.current = path;
  return renderToStaticMarkup(<AppHeader />);
}

/** Opening tags of all links in the markup. */
function links(html: string): string[] {
  return html.match(/<a [^>]*>/g) ?? [];
}

describe('AppHeader', () => {
  beforeEach(() => {
    pathname.current = '/';
  });

  it('should show the name and the tagline at the top left', () => {
    const html = render('/');
    expect(html).toContain('Xiangqi Arena - Cờ Tướng Arena');
    expect(html).toContain('Nền tảng Cờ Tướng Trực Tuyến');
    expect(html.indexOf('<header')).toBeLessThan(html.indexOf('Xiangqi Arena - Cờ Tướng Arena'));
  });

  it('should open Home when the logo is clicked', () => {
    const [logo] = links(render('/leaderboard'));
    expect(logo).toContain('href="/"');
  });

  it('should keep the logo on Home when the player is already on Home', () => {
    const [logo] = links(render('/'));
    expect(logo).toContain('href="/"');
    expect(logo).not.toContain('aria-current');
  });

  it('should render the menu links in the right order with the right targets', () => {
    const [, ...menu] = links(render('/'));
    expect(menu).toHaveLength(NAV_ITEMS.length);
    menu.forEach((link, index) => {
      expect(link).toContain(`href="${NAV_ITEMS[index]?.href}"`);
    });
  });

  it.each(NAV_ITEMS.map((item) => [item.label, item.href] as const))(
    'should underline only %s on its page',
    (_label, href) => {
      const [, ...menu] = links(render(href));
      const active = menu.filter((link) => link.includes('aria-current="page"'));
      expect(active).toHaveLength(1);
      expect(active[0]).toContain(`href="${href}"`);
      expect(active[0]).toContain('border-gold');
      for (const link of menu.filter((l) => l !== active[0])) {
        expect(link).not.toContain('border-gold');
      }
    },
  );

  it('should underline no link on a page that no menu link opens', () => {
    const [, ...menu] = links(render('/profile'));
    expect(menu.some((link) => link.includes('aria-current'))).toBe(false);
  });

  it('should use a header landmark and a labelled navigation landmark', () => {
    const html = render('/');
    expect(html).toContain('<header');
    expect(html).toContain('<nav aria-label="Menu chính"');
  });
});
