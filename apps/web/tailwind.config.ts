import type { Config } from 'tailwindcss';

/** Every color comes from a CSS variable of src/app/globals.css. */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          inset: 'var(--color-surface-inset)',
          selected: 'var(--color-surface-selected)',
        },
        line: {
          DEFAULT: 'var(--color-line)',
          card: 'var(--color-line-card)',
        },
        fg: {
          DEFAULT: 'var(--color-fg)',
          muted: 'var(--color-fg-muted)',
        },
        gold: 'var(--color-gold)',
        primary: 'var(--color-primary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        highlight: 'var(--color-highlight)',
        // Board colors of the game (not part of the app shell palette).
        board: '#e8c98a',
        red: { piece: '#c0392b' },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
};

export default config;
