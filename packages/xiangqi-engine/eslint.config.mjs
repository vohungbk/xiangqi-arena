import { base } from '@xiangqi/config-eslint/index.mjs';

/**
 * The engine is pure (ENG-F01 R14): no network, database, clock, randomness or Node module.
 * The same input must give the same output. These rules keep it so at the time of writing.
 */
const IMPURE_GLOBALS = [
  'Date',
  'performance',
  'setTimeout',
  'setInterval',
  'setImmediate',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'process',
  'window',
  'document',
].map((name) => ({
  name,
  message: `The engine must be pure: do not use ${name} (ENG-F01 R14).`,
}));

export default [
  ...base,
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.test.ts'],
    rules: {
      'no-restricted-globals': ['error', ...IMPURE_GLOBALS],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: 'The engine must be pure: do not use Math.random (ENG-F01 R14).',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!@xiangqi/shared-types$|\\.{1,2}/).*',
              message: 'The engine may import only @xiangqi/shared-types and its own files.',
            },
          ],
        },
      ],
    },
  },
];
