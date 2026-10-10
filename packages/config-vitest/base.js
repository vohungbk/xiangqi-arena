/** Shared Vitest options. Every package spreads `coverage` into its own config. */
module.exports = {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'lcov'],
    reportsDirectory: 'coverage',
    include: ['src/**/*.{ts,tsx}'],
    exclude: ['src/**/*.test.{ts,tsx}'],
  },
};
