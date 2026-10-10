import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const PKG_DIR = resolve(__dirname, '..');
const ROOT = resolve(PKG_DIR, '../..');
const VITEST_BIN = join(PKG_DIR, 'node_modules/.bin/vitest');

interface PackageJson {
  name: string;
  scripts?: Record<string, string>;
}

const workspacePackages = ['apps', 'packages'].flatMap((group) =>
  readdirSync(join(ROOT, group))
    .map((name) => join(ROOT, group, name))
    .filter((path) => existsSync(join(path, 'package.json'))),
);

function readPackage(path: string): PackageJson {
  return JSON.parse(readFileSync(join(path, 'package.json'), 'utf8')) as PackageJson;
}

// The fixture lives inside this package so `vitest` and the coverage provider resolve.
let dir: string;

beforeAll(() => {
  dir = mkdtempSync(join(PKG_DIR, '.tmp-'));
  mkdirSync(join(dir, 'src'));
  writeFileSync(join(dir, 'src/sum.ts'), 'export const sum = (a: number, b: number) => a + b;\n');
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

function runVitest(args: string[]) {
  return spawnSync(VITEST_BIN, ['run', '--root', dir, ...args], {
    cwd: dir,
    encoding: 'utf8',
  });
}

describe('every package runs its tests with Vitest', () => {
  it('should find the workspace packages', () => {
    expect(workspacePackages.length).toBeGreaterThanOrEqual(6);
  });

  it.each(workspacePackages)('should use vitest run for the test script in %s', (path) => {
    expect(readPackage(path).scripts?.test).toMatch(/^vitest run/);
  });

  it.each(workspacePackages)('should define a test:coverage script in %s', (path) => {
    expect(readPackage(path).scripts?.['test:coverage']).toMatch(/^vitest run .*--coverage/);
  });
});

describe('root test command', () => {
  it('should run the test task of all packages through turbo', () => {
    const root = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as PackageJson;
    expect(root.scripts?.test).toBe('turbo run test');
    expect(root.scripts?.['test:coverage']).toBe('turbo run test:coverage');
  });
});

describe('vitest exit code', () => {
  it('should exit 0 when all tests pass', () => {
    writeFileSync(
      join(dir, 'src/pass.test.ts'),
      "import { expect, it } from 'vitest';\nit('passes', () => expect(1).toBe(1));\n",
    );
    expect(runVitest([]).status).toBe(0);
  });

  it('should exit with a non-zero code when a test fails', () => {
    writeFileSync(
      join(dir, 'src/fail.test.ts'),
      "import { expect, it } from 'vitest';\nit('fails', () => expect(1).toBe(2));\n",
    );
    const result = runVitest([]);
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain('fail.test.ts');
  });
});

describe('coverage report', () => {
  it('should write coverage/lcov.info when the test run has coverage', () => {
    rmSync(join(dir, 'src/fail.test.ts'), { force: true });
    writeFileSync(
      join(dir, 'src/sum.test.ts'),
      "import { expect, it } from 'vitest';\nimport { sum } from './sum';\nit('adds', () => expect(sum(1, 2)).toBe(3));\n",
    );
    const result = runVitest([
      '--coverage.enabled',
      '--coverage.provider=v8',
      '--coverage.reporter=lcov',
      '--coverage.include=src/**/*.ts',
      '--coverage.exclude=src/**/*.test.ts',
    ]);
    expect(result.status).toBe(0);
    const report = join(dir, 'coverage/lcov.info');
    expect(existsSync(report)).toBe(true);
    expect(readFileSync(report, 'utf8')).toContain('sum.ts');
  });
});
