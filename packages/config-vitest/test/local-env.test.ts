import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '../../..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (['node_modules', 'dist', '.next', 'coverage', '.turbo'].includes(name)) return [];
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|mjs)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

/** Names of environment variables that the code and the local setup read. */
function usedVariables(): Set<string> {
  const names = new Set<string>();
  const patterns = [
    /process\.env\.([A-Z][A-Z0-9_]+)/g,
    /config\.(?:get|getOrThrow)(?:<[^>]+>)?\(\s*'([A-Z][A-Z0-9_]+)'/g,
  ];
  const files = [...sourceFiles(join(ROOT, 'apps')), ...sourceFiles(join(ROOT, 'packages'))];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const pattern of patterns) {
      for (const match of text.matchAll(pattern)) names.add(match[1] as string);
    }
  }
  const schema = readFileSync(join(ROOT, 'apps/server/prisma/schema.prisma'), 'utf8');
  for (const match of schema.matchAll(/env\("([A-Z][A-Z0-9_]+)"\)/g)) names.add(match[1] as string);
  const compose = readFileSync(join(ROOT, 'docker-compose.yml'), 'utf8');
  for (const match of compose.matchAll(/\$\{([A-Z][A-Z0-9_]+)/g)) names.add(match[1] as string);
  return names;
}

function parseEnv(text: string): Map<string, string> {
  const entries = new Map<string, string>();
  for (const line of text.split('\n')) {
    const match = /^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (match) entries.set(match[1] as string, match[2]?.replace(/^['"]|['"]$/g, '') ?? '');
  }
  return entries;
}

const example = parseEnv(readFileSync(join(ROOT, '.env.example'), 'utf8'));

describe('.env.example', () => {
  it('should list every variable that the code reads', () => {
    const missing = [...usedVariables()].filter((name) => !example.has(name)).sort();
    expect(missing).toEqual([]);
  });

  it('should not contain a value that looks like a real secret', () => {
    const realLooking = /^(sk[-_]|ghp_|gho_|github_pat_|xox[bap]-|AKIA|AIza|eyJ)/;
    const offenders = [...example].filter(([, value]) => realLooking.test(value)).map(([k]) => k);
    expect(offenders).toEqual([]);
  });

  it('should use an obvious placeholder for secret variables', () => {
    const secretName = /(SECRET|PASSWORD|TOKEN|API_KEY|PRIVATE_KEY)/;
    const placeholder = /(change|example|placeholder|dev|local|your|xxx|test)/i;
    const offenders = [...example]
      .filter(([name, value]) => secretName.test(name) && value !== '' && !placeholder.test(value))
      .map(([name]) => name);
    expect(offenders).toEqual([]);
  });

  it('should keep secrets out of NEXT_PUBLIC variables', () => {
    const offenders = [...example.keys()].filter(
      (name) => name.startsWith('NEXT_PUBLIC_') && /(SECRET|PASSWORD|TOKEN|PRIVATE)/.test(name),
    );
    expect(offenders).toEqual([]);
  });
});

describe('git ignore rules for env files', () => {
  function isIgnored(path: string): boolean {
    return spawnSync('git', ['check-ignore', '-q', path], { cwd: ROOT }).status === 0;
  }

  it.each([
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    'apps/server/.env',
    'apps/web/.env.local',
  ])('should ignore %s', (path) => {
    expect(isIgnored(path)).toBe(true);
  });

  it('should not ignore .env.example', () => {
    expect(isIgnored('.env.example')).toBe(false);
  });

  it('should keep .env.example in the repository', () => {
    expect(existsSync(join(ROOT, '.env.example'))).toBe(true);
  });
});
