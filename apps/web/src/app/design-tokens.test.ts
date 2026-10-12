import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const WEB_DIR = resolve(__dirname, '../..');
const globals = readFileSync(join(__dirname, 'globals.css'), 'utf8');

function declaredVariables(): Map<string, string> {
  const vars = new Map<string, string>();
  for (const match of globals.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) {
    vars.set(match[1] as string, (match[2] as string).replace(/\/\*.*$/, '').trim());
  }
  return vars;
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

describe('design tokens', () => {
  const vars = declaredVariables();

  const colorVars = [...vars].filter(([name]) => name.startsWith('--color-'));
  const isAlias = (value: string) => value.startsWith('var(');

  it('should write every color token as a six digit hex value', () => {
    const tokens = colorVars.filter(([, value]) => !isAlias(value));
    expect(tokens.length).toBeGreaterThanOrEqual(12);
    for (const [name, value] of tokens) {
      expect(value, name).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('should only alias a color to a token that exists', () => {
    const aliases = colorVars.filter(([, value]) => isAlias(value));
    expect(aliases.map(([name]) => name)).toEqual(['--color-app']);
    for (const [name, value] of aliases) {
      const target = /^var\((--[a-z0-9-]+)\)$/.exec(value)?.[1] ?? '';
      expect(vars.has(target), `${name} -> ${target}`).toBe(true);
    }
  });

  it('should keep the colors that the components use as Tailwind utilities', () => {
    const names = [
      'app',
      'surface',
      'surface-inset',
      'surface-selected',
      'line',
      'line-card',
      'fg',
      'fg-muted',
      'gold',
      'primary',
      'success',
      'warning',
      'danger',
      'highlight',
    ];
    const missing = names.filter((name) => !vars.has(`--color-${name}`));
    expect(missing).toEqual([]);
  });

  it('should declare the tokens in a Tailwind theme and no longer use a JS config', () => {
    expect(globals).toMatch(/@import 'tailwindcss';/);
    expect(globals).toMatch(/@theme\s*{/);
    expect(existsSync(join(WEB_DIR, 'tailwind.config.ts'))).toBe(false);
  });

  it('should use the page background and the font of the design on the body', () => {
    expect(vars.get('--color-bg')).toBe('#111629');
    expect(globals).toMatch(/body\s*{[^}]*font-family:\s*var\(--font-sans\)/);
  });

  it('should keep the Inter font first in the sans stack', () => {
    expect(vars.get('--font-sans')).toMatch(/^'Inter Variable'/);
  });

  it('should keep raw palette classes and hex colors out of the components', () => {
    const offenders = sourceFiles(join(WEB_DIR, 'src'))
      .filter((file) => !file.endsWith('VietnamFlag.tsx'))
      .filter((file) =>
        /(?:bg|text|border)-(?:neutral|slate|gray|zinc|white\/|black\/)|#[0-9a-fA-F]{6}\b/.test(
          readFileSync(file, 'utf8'),
        ),
      )
      .map((file) => file.replace(WEB_DIR, ''));
    expect(offenders).toEqual([]);
  });
});
