import sharedRules from '@xiangqi/config-eslint/rules.js';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

/**
 * Flat config of the web app (ESLint 9, eslint-config-next 16). The server and the packages still
 * use `@xiangqi/config-eslint/index.mjs` with ESLint 10. Both share `@xiangqi/config-eslint/rules.js`.
 */
export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  { rules: sharedRules },
  globalIgnores(['.next/**', 'dist/**', 'coverage/**', 'node_modules/**', '.turbo/**']),
]);
