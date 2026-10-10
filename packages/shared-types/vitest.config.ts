import { defineConfig } from 'vitest/config';
import base from '@xiangqi/config-vitest';

export default defineConfig({
  test: { pool: 'threads', coverage: base.coverage },
});
