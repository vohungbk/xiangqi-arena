/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./base.js'],
  env: { node: true, jest: false },
  rules: {
    // Nest uses decorators and DI with empty constructors.
    '@typescript-eslint/no-extraneous-class': 'off',
  },
};
