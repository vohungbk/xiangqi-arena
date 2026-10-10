import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const ROOT = resolve(__dirname, '../../..');

interface Step {
  name?: string;
  uses?: string;
  run?: string;
  if?: string;
  with?: Record<string, unknown>;
}

interface Workflow {
  on: { pull_request?: { types?: string[] }; pull_request_target?: unknown };
  permissions?: Record<string, string>;
  jobs: Record<string, { name?: string; steps: Step[] }>;
}

const workflow = parse(readFileSync(join(ROOT, '.github/workflows/ci.yml'), 'utf8')) as Workflow;
const steps = workflow.jobs.ci?.steps ?? [];
const commands = steps.map((step) => step.run ?? '');

describe('CI workflow', () => {
  it('should run on pull request opened, synchronize and reopened', () => {
    expect(workflow.on.pull_request?.types).toEqual(['opened', 'synchronize', 'reopened']);
  });

  it('should not use pull_request_target', () => {
    expect(workflow.on.pull_request_target).toBeUndefined();
  });

  it('should use read-only repository permissions', () => {
    expect(workflow.permissions).toEqual({ contents: 'read' });
  });

  it('should expose one job named ci for branch protection', () => {
    expect(Object.keys(workflow.jobs)).toEqual(['ci']);
    expect(workflow.jobs.ci?.name).toBe('ci');
  });

  it('should install with a frozen lockfile before the checks', () => {
    const install = commands.findIndex((c) => c.includes('pnpm install --frozen-lockfile'));
    const lint = commands.findIndex((c) => c === 'pnpm lint');
    expect(install).toBeGreaterThanOrEqual(0);
    expect(install).toBeLessThan(lint);
  });

  it.each(['pnpm lint', 'pnpm typecheck', 'pnpm format:check'])(
    'should run %s as a required step',
    (command) => {
      const step = steps.find((s) => s.run === command);
      expect(step).toBeDefined();
      expect(step?.if).toBeUndefined();
    },
  );

  it('should run the Vitest tests with coverage', () => {
    expect(commands.some((c) => c.startsWith('pnpm test:coverage'))).toBe(true);
  });

  it('should cache pnpm dependencies', () => {
    const setupNode = steps.find((s) => s.uses?.startsWith('actions/setup-node'));
    expect(setupNode?.with?.cache).toBe('pnpm');
  });

  it('should write the run summary even when a step fails', () => {
    const summary = steps.find((s) => s.run?.includes('GITHUB_STEP_SUMMARY'));
    expect(summary?.if).toBe('always()');
  });
});

describe('ci-summary script', () => {
  let dir: string;
  let lib: typeof import('../../../.github/scripts/ci-summary.mjs');

  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), 'xiangqi-ci-'));
    lib = await import(pathToFileURL(join(ROOT, '.github/scripts/ci-summary.mjs')).href);
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function makePackage(group: string, name: string, files: Record<string, string>) {
    const pkg = join(dir, group, name);
    mkdirSync(pkg, { recursive: true });
    writeFileSync(join(pkg, 'package.json'), '{}');
    for (const [file, content] of Object.entries(files)) {
      mkdirSync(join(pkg, file, '..'), { recursive: true });
      writeFileSync(join(pkg, file), content);
    }
  }

  it('should sum lines found and hit from an lcov report', () => {
    const text = 'SF:a.ts\nLF:10\nLH:8\nend_of_record\nSF:b.ts\nLF:5\nLH:5\nend_of_record\n';
    expect(lib.parseLcov(text)).toEqual({ found: 15, hit: 13 });
  });

  it('should read the counters of a Vitest json report', () => {
    const text = JSON.stringify({ numTotalTests: 4, numPassedTests: 3, numFailedTests: 1 });
    expect(lib.parseTestResults(text)).toEqual({ total: 4, passed: 3, failed: 1 });
  });

  it('should render test counts and coverage per package and in total', () => {
    makePackage('packages', 'a', {
      'test-results.json': JSON.stringify({
        numTotalTests: 4,
        numPassedTests: 4,
        numFailedTests: 0,
      }),
      'coverage/lcov.info': 'LF:10\nLH:5\n',
    });
    makePackage('apps', 'b', {
      'test-results.json': JSON.stringify({
        numTotalTests: 2,
        numPassedTests: 1,
        numFailedTests: 1,
      }),
      'coverage/lcov.info': 'LF:10\nLH:10\n',
    });
    const markdown = lib.renderSummary(lib.collectRows(dir));
    expect(markdown).toContain('| apps/b | 2 | 1 | 1 | 100.0% |');
    expect(markdown).toContain('| packages/a | 4 | 4 | 0 | 50.0% |');
    expect(markdown).toContain('| **Total** | **6** | **5** | **1** | **75.0%** |');
  });

  it('should show no report instead of failing when a package has no results', () => {
    makePackage('packages', 'empty', {});
    const markdown = lib.renderSummary(lib.collectRows(dir));
    expect(markdown).toContain('| packages/empty | no result | - | - | no report |');
  });
});
