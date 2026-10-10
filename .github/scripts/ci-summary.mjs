// Builds a Markdown summary of test results and coverage for the GitHub run summary.
// Reads `test-results.json` (Vitest json reporter) and `coverage/lcov.info` of each package.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Sums lines found (LF) and lines hit (LH) of an lcov report. */
export function parseLcov(text) {
  let found = 0;
  let hit = 0;
  for (const line of text.split('\n')) {
    if (line.startsWith('LF:')) found += Number(line.slice(3));
    else if (line.startsWith('LH:')) hit += Number(line.slice(3));
  }
  return { found, hit };
}

/** Reads the counters of a Vitest json report. */
export function parseTestResults(text) {
  const data = JSON.parse(text);
  return {
    total: data.numTotalTests ?? 0,
    passed: data.numPassedTests ?? 0,
    failed: data.numFailedTests ?? 0,
  };
}

function percent({ found, hit }) {
  if (found === 0) return '-';
  return `${((hit / found) * 100).toFixed(1)}%`;
}

/** Collects one row per workspace package. A missing report gives `null` for that part. */
export function collectRows(root) {
  const rows = [];
  for (const group of ['apps', 'packages']) {
    const groupDir = join(root, group);
    if (!existsSync(groupDir)) continue;
    for (const name of readdirSync(groupDir).sort()) {
      const dir = join(groupDir, name);
      if (!existsSync(join(dir, 'package.json'))) continue;
      const resultsFile = join(dir, 'test-results.json');
      const lcovFile = join(dir, 'coverage', 'lcov.info');
      rows.push({
        name: `${group}/${name}`,
        tests: existsSync(resultsFile) ? parseTestResults(readFileSync(resultsFile, 'utf8')) : null,
        coverage: existsSync(lcovFile) ? parseLcov(readFileSync(lcovFile, 'utf8')) : null,
      });
    }
  }
  return rows;
}

export function renderSummary(rows) {
  const lines = [
    '## Test and coverage summary',
    '',
    '| Package | Tests | Passed | Failed | Line coverage |',
    '| --- | ---: | ---: | ---: | ---: |',
  ];
  const totals = { total: 0, passed: 0, failed: 0 };
  const coverageTotal = { found: 0, hit: 0 };
  for (const row of rows) {
    if (row.tests) {
      totals.total += row.tests.total;
      totals.passed += row.tests.passed;
      totals.failed += row.tests.failed;
    }
    if (row.coverage) {
      coverageTotal.found += row.coverage.found;
      coverageTotal.hit += row.coverage.hit;
    }
    const tests = row.tests
      ? `${row.tests.total} | ${row.tests.passed} | ${row.tests.failed}`
      : 'no result | - | -';
    const coverage = row.coverage ? percent(row.coverage) : 'no report';
    lines.push(`| ${row.name} | ${tests} | ${coverage} |`);
  }
  lines.push(
    `| **Total** | **${totals.total}** | **${totals.passed}** | **${totals.failed}** | **${percent(coverageTotal)}** |`,
  );
  return `${lines.join('\n')}\n`;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.stdout.write(renderSummary(collectRows(process.cwd())));
}
