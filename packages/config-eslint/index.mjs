import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import sharedRules from './rules.js';

/**
 * Shared flat configs (ESLint 10) for the server and the packages. The web app has its own flat
 * config (ESLint 9, eslint-config-next) and uses only `rules.js`.
 */

/** TypeScript on Node. */
export const base = [
  { ignores: ['dist/**', '.next/**', 'node_modules/**', '.turbo/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  { languageOptions: { globals: { ...globals.node } } },
  { rules: sharedRules },
];

/** The Nest server. It uses decorators and DI with empty constructors. */
export const nest = [...base, { rules: { '@typescript-eslint/no-extraneous-class': 'off' } }];

/** Code that runs in a browser Web Worker, for example the Pikafish engine. */
export const worker = [
  ...base,
  { languageOptions: { globals: { ...globals.browser, ...globals.worker } } },
];
