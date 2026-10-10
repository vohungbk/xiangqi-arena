import { defineConfig } from 'vitest/config';
import base from '@xiangqi/config-vitest';

export default defineConfig({
  test: {
    pool: 'threads',
    environment: 'node',
    setupFiles: ['./test/setup-offline.ts'],
    coverage: base.coverage,
  },
});
