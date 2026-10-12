import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const PKG_DIR = resolve(__dirname, '..');
const ROOT = resolve(PKG_DIR, '../..');
const ESLINT_BIN = join(PKG_DIR, 'node_modules/.bin/eslint');
const PRETTIER_BIN = join(PKG_DIR, 'node_modules/.bin/prettier');

let dir: string;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'xiangqi-lint-'));
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

function writeFixture(name: string, content: string): string {
  const file = join(dir, name);
  writeFileSync(file, content);
  return file;
}

function lint(file: string) {
  return spawnSync(
    ESLINT_BIN,
    [
      '--no-eslintrc',
      '-c',
      join(PKG_DIR, 'base.js'),
      '--resolve-plugins-relative-to',
      PKG_DIR,
      file,
    ],
    { encoding: 'utf8' },
  );
}

function formatCheck(file: string) {
  return spawnSync(PRETTIER_BIN, ['--check', '--config', join(ROOT, '.prettierrc'), file], {
    encoding: 'utf8',
  });
}

describe('shared ESLint config', () => {
  it('should exit 0 when the file follows the rules', () => {
    const file = writeFixture('ok.ts', 'export const answer: number = 42;\n');
    expect(lint(file).status).toBe(0);
  });

  it('should fail and show file and line when a rule is broken', () => {
    const file = writeFixture('bad.ts', 'export const a = 1;\nexport const b: any = 2;\n');
    const result = lint(file);
    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain(file);
    expect(result.stdout).toMatch(/\n\s*2:\d+\s+error/);
  });

  it('should fail when a variable is unused', () => {
    const file = writeFixture('unused.ts', 'const unused = 1;\nexport const used = 2;\n');
    const result = lint(file);
    expect(result.status).not.toBe(0);
    expect(result.stdout).toMatch(/\n\s*1:\d+\s+error/);
  });

  it('should ignore unused arguments that start with an underscore', () => {
    const file = writeFixture('args.ts', 'export const fn = (_unused: number) => 1;\n');
    expect(lint(file).status).toBe(0);
  });
});

describe('every package uses the shared ESLint config', () => {
  const packages = ['apps', 'packages'].flatMap((group) =>
    readdirSync(join(ROOT, group))
      .map((name) => join(ROOT, group, name))
      .filter((path) => existsSync(join(path, 'package.json')))
      .filter((path) => !path.includes('/config-')),
  );

  it('should find the workspace packages', () => {
    expect(packages.length).toBeGreaterThanOrEqual(4);
  });

  // The web app uses a flat config (ESLint 9) with the shared rules. The others extend base.js.
  it.each(packages)('should use @xiangqi/config-eslint in %s', (path) => {
    const file = ['.eslintrc.js', 'eslint.config.mjs'].find((name) => existsSync(join(path, name)));
    expect(file, `no ESLint config in ${path}`).toBeTruthy();
    const config = readFileSync(join(path, file as string), 'utf8');
    expect(config).toContain('@xiangqi/config-eslint');
  });

  it('should give the flat config of the web app the same rules as base.js', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const shared = require(join(PKG_DIR, 'rules.js')) as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const base = require(join(PKG_DIR, 'base.js')) as { rules: Record<string, unknown> };
    expect(base.rules).toEqual(shared);
    expect(shared['@typescript-eslint/no-explicit-any']).toBe('error');
  });

  it.each(packages)('should define a lint script in %s', (path) => {
    const pkg = JSON.parse(readFileSync(join(path, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.lint).toBeTruthy();
  });
});

describe('shared Prettier config', () => {
  it('should exit 0 when the file is formatted', () => {
    const file = writeFixture('formatted.ts', "export const a = 'x';\n");
    expect(formatCheck(file).status).toBe(0);
  });

  it('should fail and name the file when it is not formatted', () => {
    const file = writeFixture('messy.ts', 'export   const a =   "x"\n');
    const result = formatCheck(file);
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(file);
  });

  it('should fail when the file uses double quotes', () => {
    const file = writeFixture('quotes.ts', 'export const a = "x";\n');
    expect(formatCheck(file).status).not.toBe(0);
  });
});
