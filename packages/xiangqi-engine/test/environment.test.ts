import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const FORBIDDEN_PACKAGES = [
  '@prisma/client',
  'ioredis',
  'pg',
  'socket.io',
  'socket.io-client',
  'react',
  'next',
  'bullmq',
];

describe('engine environment', () => {
  it('should run in Node without browser globals', () => {
    for (const name of ['window', 'document', 'Worker']) {
      expect(name in globalThis).toBe(false);
    }
  });

  it('should fail when code tries to use the network', () => {
    expect(() => fetch('http://localhost:4000/health')).toThrow('Network access is not allowed');
  });

  it('should depend only on shared-types at runtime', () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const deps = Object.keys(pkg.dependencies ?? {});
    expect(deps).toEqual(['@xiangqi/shared-types']);
    expect(deps.filter((name) => FORBIDDEN_PACKAGES.includes(name))).toEqual([]);
  });
});
