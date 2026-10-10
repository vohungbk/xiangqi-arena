import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        board: '#e8c98a',
        gold: '#C5A059',
        // Navigation bar of the design (Figma frame "B2 Hồ sơ công khai · Desktop 1440").
        navy: { DEFAULT: '#111629', border: '#364054', muted: '#98A2B7' },
        red: { piece: '#c0392b' },
      },
    },
  },
  plugins: [],
};

export default config;
