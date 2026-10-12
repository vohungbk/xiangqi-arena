/**
 * Rules shared by every package. `base.js` (ESLint 8, eslintrc) and the flat config of the web
 * app (ESLint 9) both use this object, so the rules stay the same.
 */
module.exports = {
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/consistent-type-imports': 'warn',
};
