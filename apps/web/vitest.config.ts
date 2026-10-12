import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import base from '@xiangqi/config-vitest';

export default defineConfig({
  // tsconfig keeps JSX for Next.js. Vitest needs the automatic runtime for .tsx tests.
  // Vite 8 transforms with Oxc, so this is `oxc` and no longer `esbuild`.
  oxc: { jsx: { runtime: 'automatic' } },
  // Same alias as `paths` in tsconfig.json.
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    pool: 'threads',
    environment: 'node',
    // Stand-ins for the browser APIs that Radix UI needs and jsdom lacks.
    setupFiles: ['./src/test-setup.ts'],
    coverage: base.coverage,
  },
});
