import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ESLint } from 'eslint';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  allPoints,
  parseFen,
  Side,
  START_FEN,
  textToMove,
  type Move,
  type Position,
} from '@xiangqi/shared-types';
import {
  applyMove,
  applyMoveWithCapture,
  clonePosition,
  countPieces,
  createStartingPosition,
  getPiece,
  getZone,
  isAcrossRiver,
  isInPalace,
  palaceBounds,
  pieceAt,
  positionsEqual,
  positionToFen,
  readAllPoints,
  readPoint,
  riverSideOf,
} from '../src';

const ENGINE_DIR = join(__dirname, '..');
const SHARED_DIR = join(__dirname, '../../shared-types');
const SHARED_NAME = '@xiangqi/shared-types';

/** Files of a package that a build emits: `src/*.ts` without the tests. */
function sourceFiles(packageDir: string): string[] {
  const dir = join(packageDir, 'src');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))
    .map((name) => join(dir, name));
}

/** The modules that the JavaScript a build would emit requires at run time. */
function emittedRequires(packageDir: string): string[] {
  const modules = new Set<string>();
  for (const file of sourceFiles(packageDir)) {
    const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    for (const match of outputText.matchAll(/require\("([^"]+)"\)/g)) modules.add(match[1]!);
  }
  return [...modules].sort();
}

function readPackageJson(packageDir: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8')) as Record<
    string,
    unknown
  >;
}

const GAME = ['b2c2', 'b7e7', 'c2c6', 'e7e3', 'c6c9', 'h7h4', 'e3e4', 'i3i4', 'c9a9', 'a0a4'];

/** Play moves from the start and record the FEN and the capture after each one. */
function playGame(): string[] {
  const record: string[] = [];
  let position = createStartingPosition();
  for (const text of GAME) {
    const move = textToMove(text);
    let result;
    try {
      result = applyMoveWithCapture(position, move);
    } catch {
      record.push(`refused ${text}`);
      continue;
    }
    position = result.position;
    record.push(`${positionToFen(position)} ${JSON.stringify(result.captured)}`);
  }
  return record;
}

/** A position in the middle of a game, built with the engine. */
function middlePosition(): Position {
  let position = createStartingPosition();
  for (const text of ['b2c2', 'b7e7', 'c2c6', 'e7e3']) {
    position = applyMove(position, textToMove(text));
  }
  return position;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('the engine has no network, database or clock dependency', () => {
  it('should have no runtime dependency other than shared-types', () => {
    const pkg = readPackageJson(ENGINE_DIR);
    expect(Object.keys((pkg.dependencies as object) ?? {})).toEqual([SHARED_NAME]);
    expect(pkg.peerDependencies).toBeUndefined();
    expect(pkg.optionalDependencies).toBeUndefined();
  });

  it('should keep the test runner as a development dependency only', () => {
    const pkg = readPackageJson(ENGINE_DIR);
    const dependencies = Object.keys((pkg.dependencies as object) ?? {});
    expect(dependencies).not.toContain('vitest');
    expect(Object.keys((pkg.devDependencies as object) ?? {})).toContain('vitest');
  });

  it('should have no dependency in shared-types, which the engine requires at run time', () => {
    expect(readPackageJson(SHARED_DIR).dependencies).toBeUndefined();
  });

  it('should give the same result whatever the clock says', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2000-01-01T00:00:00Z'));
    const early = playGame();
    vi.setSystemTime(new Date('2040-06-15T12:34:56Z'));
    const late = playGame();
    expect(late).toEqual(early);
    expect(early.length).toBe(GAME.length);
  });

  it('should not use a random source', () => {
    vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('The engine must not use Math.random');
    });
    expect(() => playGame()).not.toThrow();
  });

  it('should not reach the network', () => {
    // setup-offline.ts replaces fetch with a function that throws.
    expect(() => playGame()).not.toThrow();
    expect(() => fetch('http://localhost:4000/health')).toThrow('Network access is not allowed');
  });

  it('should refuse a clock, a network call or a third-party import in the source', async () => {
    const eslint = new ESLint({ cwd: ENGINE_DIR });
    const lint = async (code: string) => {
      const [result] = await eslint.lintText(code, {
        filePath: join(ENGINE_DIR, 'src/impure.ts'),
      });
      return (result?.messages ?? []).map((message) => message.ruleId);
    };
    expect(await lint('export const now = Date.now();\n')).toContain('no-restricted-globals');
    expect(await lint('export const roll = Math.random();\n')).toContain(
      'no-restricted-properties',
    );
    expect(await lint("import { readFileSync } from 'node:fs';\nvoid readFileSync;\n")).toContain(
      'no-restricted-imports',
    );
    expect(await lint("import pg from 'pg';\nvoid pg;\n")).toContain('no-restricted-imports');
    expect(
      await lint("import { START_FEN } from '@xiangqi/shared-types';\nvoid START_FEN;\n"),
    ).not.toContain('no-restricted-imports');
  }, 30_000);
});

describe('the same input gives the same output', () => {
  const positions: Position[] = [createStartingPosition(), middlePosition()];
  const moves: Move[] = [textToMove('b2e2'), textToMove('c2c6'), textToMove('a9a8')];

  /** Call twice and return the two results. */
  function twice<T>(run: () => T): [T, T] {
    return [run(), run()];
  }

  it('should create the same starting position every time', () => {
    const [a, b] = twice(createStartingPosition);
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });

  it('should read the same piece, point and zone every time', () => {
    for (const position of positions) {
      for (const point of allPoints()) {
        const [piece1, piece2] = twice(() => getPiece(position, point));
        expect(piece1).toEqual(piece2);
        const [read1, read2] = twice(() => readPoint(position, point));
        expect(read1).toEqual(read2);
        const [zone1, zone2] = twice(() => getZone(point));
        expect(zone1).toEqual(zone2);
        for (const side of [Side.RED, Side.BLACK]) {
          expect(twice(() => isInPalace(point, side))[0]).toBe(isInPalace(point, side));
          expect(twice(() => isAcrossRiver(point, side))[0]).toBe(isAcrossRiver(point, side));
        }
        expect(twice(() => riverSideOf(point))[0]).toBe(riverSideOf(point));
      }
      const [all1, all2] = twice(() => readAllPoints(position));
      expect(all1).toEqual(all2);
      expect(all1).toHaveLength(90);
    }
    expect(twice(() => palaceBounds(Side.RED))[0]).toEqual(palaceBounds(Side.RED));
  });

  it('should count, copy, compare and write a position the same way every time', () => {
    for (const position of positions) {
      for (const side of [Side.RED, Side.BLACK]) {
        const board = parseFen(positionToFen(position)).board;
        const [a, b] = twice(() => countPieces(board, side));
        expect(a).toEqual(b);
      }
      expect(twice(() => positionToFen(position))[0]).toBe(positionToFen(position));
      expect(twice(() => clonePosition(position))[0]).toEqual(clonePosition(position));
      expect(twice(() => positionsEqual(position, clonePosition(position)))).toEqual([true, true]);
    }
  });

  it('should read the same piece from a FEN board every time', () => {
    const { board } = parseFen(START_FEN);
    for (const point of allPoints()) {
      const [a, b] = twice(() => pieceAt(board, point));
      expect(a).toBe(b);
    }
  });

  it('should apply a move to the same result every time and not change the input', () => {
    for (const position of positions) {
      const before = positionToFen(position);
      for (const move of moves) {
        const outcome = () => {
          try {
            return applyMoveWithCapture(position, move);
          } catch (error) {
            return (error as Error).message;
          }
        };
        const [a, b] = twice(outcome);
        expect(a).toEqual(b);
        const [c, d] = twice(() => {
          try {
            return positionToFen(applyMove(position, move));
          } catch (error) {
            return (error as Error).message;
          }
        });
        expect(c).toBe(d);
      }
      expect(positionToFen(position)).toBe(before);
    }
  });
});

describe('the built package has no external runtime dependency', () => {
  it('should require only shared-types and its own files in the engine', () => {
    const modules = emittedRequires(ENGINE_DIR);
    expect(modules.length).toBeGreaterThan(0);
    for (const name of modules) {
      expect(name === SHARED_NAME || name.startsWith('./'), name).toBe(true);
    }
  });

  it('should require only its own files in shared-types', () => {
    for (const name of emittedRequires(SHARED_DIR)) {
      expect(name.startsWith('./'), name).toBe(true);
    }
  });
});
