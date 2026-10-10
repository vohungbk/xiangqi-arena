import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const WEB_DIR = resolve(__dirname, '../..');
const globals = readFileSync(join(__dirname, 'globals.css'), 'utf8');
const tailwind = readFileSync(join(WEB_DIR, 'tailwind.config.ts'), 'utf8');

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

  it('should write every color token as a six digit hex value', () => {
    const colorVars = [...vars].filter(([name]) => name.startsWith('--color-'));
    expect(colorVars.length).toBeGreaterThanOrEqual(12);
    for (const [name, value] of colorVars) {
      expect(value, name).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('should define every variable that the Tailwind config uses', () => {
    const used = [...tailwind.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1] as string);
    expect(used.length).toBeGreaterThan(0);
    const missing = used.filter((name) => !vars.has(name));
    expect(missing).toEqual([]);
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
