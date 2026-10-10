import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const PKG_DIR = resolve(__dirname, '..');
const ROOT = resolve(PKG_DIR, '../..');
const TSC_BIN = join(PKG_DIR, 'node_modules/.bin/tsc');

let dir: string;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'xiangqi-tsc-'));
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

function typecheck(source: string) {
  const file = join(dir, 'index.ts');
  writeFileSync(file, source);
  writeFileSync(
    join(dir, 'tsconfig.json'),
    JSON.stringify({
      extends: join(PKG_DIR, 'base.json'),
      compilerOptions: { noEmit: true },
      include: ['index.ts'],
    }),
  );
  return {
    file,
    result: spawnSync(TSC_BIN, ['-p', dir, '--pretty', 'false'], { encoding: 'utf8' }),
  };
}

describe('shared strict TypeScript config', () => {
  const packages = ['apps', 'packages'].flatMap((group) =>
    readdirSync(join(ROOT, group))
      .map((name) => join(ROOT, group, name))
      .filter((path) => existsSync(join(path, 'tsconfig.json'))),
  );

  it('should find the workspace packages', () => {
    expect(packages.length).toBeGreaterThanOrEqual(4);
  });

  it.each(packages)('should resolve to strict mode in %s', (path) => {
    const result = spawnSync(TSC_BIN, ['--showConfig', '-p', path], { encoding: 'utf8' });
    expect(result.status).toBe(0);
    const config = JSON.parse(result.stdout) as { compilerOptions: { strict?: boolean } };
    expect(config.compilerOptions.strict).toBe(true);
  });
});

describe('typecheck failures', () => {
  it('should exit 0 when the code has no type error', () => {
    expect(typecheck('export const n: number = 1;\n').result.status).toBe(0);
  });

  it('should fail and show file and line when a type error exists', () => {
    const { file, result } = typecheck('export const a = 1;\nexport const n: number = "x";\n');
    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain(`${file}(2,`);
  });

  it('should fail when an implicit any is used under strict mode', () => {
    const { result } = typecheck('export const f = (x) => x;\n');
    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain('TS7006');
  });

  it('should fail when an array index may be undefined', () => {
    const { result } = typecheck(
      'const list: number[] = [];\nexport const first: number = list[0];\n',
    );
    expect(result.status).not.toBe(0);
  });
});
