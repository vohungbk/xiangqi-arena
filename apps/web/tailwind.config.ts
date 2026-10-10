import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        board: '#e8c98a',
        gold: '#C5A059',
        red: { piece: '#c0392b' },
      },
    },
  },
  plugins: [],
};

export default config;
