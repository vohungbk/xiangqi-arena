import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import base from '@xiangqi/config-vitest';

export default defineConfig({
  // tsconfig keeps JSX for Next.js. Vitest needs the automatic runtime for .tsx tests.
  esbuild: { jsx: 'automatic' },
  // Same alias as `paths` in tsconfig.json.
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { pool: 'threads', environment: 'node', coverage: base.coverage },
});
