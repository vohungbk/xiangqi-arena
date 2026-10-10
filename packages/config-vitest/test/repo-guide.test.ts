import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '../../..');
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

const readme = read('README.md');
const template = read('.github/PULL_REQUEST_TEMPLATE.md');
const rootScripts = (JSON.parse(read('package.json')) as { scripts: Record<string, string> })
  .scripts;

/** Text of one `## ` section of the README. */
function section(title: string): string {
  const match = new RegExp(`^## ${title}\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm').exec(readme);
  expect(match, `README has no "${title}" section`).not.toBeNull();
  return match?.[1] ?? '';
}

describe('README: install, run, test, lint and folders (AC01)', () => {
  it('should show how to install, start the databases and run the apps', () => {
    const text = section('Getting started');
    for (const command of ['pnpm install', 'cp .env.example .env', 'pnpm db:up', 'pnpm dev']) {
      expect(text).toContain(command);
    }
  });

  it('should only list root scripts that exist in package.json', () => {
    const listed = [...section('Scripts').matchAll(/\| `pnpm ([a-z:]+)`/g)].map((m) => m[1]);
    expect(listed.length).toBeGreaterThan(0);
    const unknown = listed.filter((name) => !((name as string) in rootScripts));
    expect(unknown).toEqual([]);
  });

  it.each(['dev', 'build', 'lint', 'typecheck', 'test', 'test:coverage', 'format:check'])(
    'should document the %s script',
    (name) => {
      expect(section('Scripts')).toContain(`\`pnpm ${name}\``);
    },
  );

  it('should list every app and package folder in the structure', () => {
    const structure = section('Structure');
    const folders = ['apps', 'packages'].flatMap((group) =>
      readdirSync(join(ROOT, group), { withFileTypes: true })
        .filter(
          (entry) =>
            entry.isDirectory() && existsSync(join(ROOT, group, entry.name, 'package.json')),
        )
        .map((entry) => entry.name),
    );
    const missing = folders.filter((name) => !structure.includes(`${name}/`));
    expect(missing).toEqual([]);
  });

  it('should not point to a worktree folder that does not exist', () => {
    expect(readme).not.toContain('.worktrees/');
  });
});

describe('README: branch and commit naming (AC03)', () => {
  const naming = section('Branch and commit naming');
  const scriptPattern = /local pattern='([^']+)'/.exec(read('.claude/bin/cc-worktree.sh'))?.[1];
  const hookPattern = /ALLOWED_PATTERN="([^"]+)"/.exec(read('.githooks/post-checkout'))?.[1];

  it('should name the story id with an example such as ENG-F02-S03', () => {
    expect(naming).toContain('story id');
    expect(naming).toContain('ENG-F02-S03');
    expect(naming).toContain('eng-f02-s03');
  });

  it('should state the commit footer that carries the story id', () => {
    expect(naming).toContain('Refs <STORY-ID>');
  });

  it('should find the branch patterns of the worktree script and the hook', () => {
    expect(scriptPattern).toBeTruthy();
    expect(hookPattern).toBeTruthy();
  });

  it.each([
    'feat/eng-f02-s03-move-validation',
    'docs/inf-f01-s06-readme-guide',
    'fix/42-auth-timeout',
    'chore/update-deps',
  ])('should accept the branch %s in the worktree script and the hook', (branch) => {
    expect(new RegExp(scriptPattern as string).test(branch)).toBe(true);
    expect(new RegExp((hookPattern as string).replace(/\\\//g, '/')).test(branch)).toBe(true);
  });

  it.each(['feature/eng-f02-s03-move', 'feat/Eng_F02', 'ENG-F02-S03'])(
    'should reject the branch %s',
    (branch) => {
      expect(new RegExp(scriptPattern as string).test(branch)).toBe(false);
    },
  );

  it('should use the same naming in the git workflow rule', () => {
    const rule = read('.claude/rules/git-workflow.md');
    expect(rule).toContain('<type>/<story-id>-<description>');
    expect(rule).toContain('Refs <STORY-ID>');
  });
});

describe('README: Definition of Done (AC04)', () => {
  const dod = section('Definition of Done');

  it.each([
    'Acceptance criteria reviewed and agreed upon',
    'Code reviewed and approved',
    'Unit and integration tests written and passing',
    'All test scenarios pass',
    'All files changed during development verified',
  ])('should list the item "%s"', (item) => {
    expect(dod).toContain(item);
  });

  it('should point to the detailed rule file that exists', () => {
    expect(dod).toContain('.claude/rules/definition-of-done.md');
    expect(existsSync(join(ROOT, '.claude/rules/definition-of-done.md'))).toBe(true);
  });
});

describe('pull request template (AC02)', () => {
  it('should ask for the linked ticket', () => {
    expect(template).toMatch(/## Related Issue[\s\S]*Closes #/);
  });

  it('should ask for the change', () => {
    expect(template).toMatch(/## Summary/);
  });

  it('should ask for the test result', () => {
    expect(template).toMatch(/Test Coverage/);
    expect(template).toMatch(/Command results/);
  });

  it('should be at the path GitHub uses by default', () => {
    expect(existsSync(join(ROOT, '.github/PULL_REQUEST_TEMPLATE.md'))).toBe(true);
  });
});
