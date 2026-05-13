import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './screens/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1db7f0',
        navy: { 900: '#0f172a', 950: '#020617' },
      },
      fontFamily: {
        sans: ['Alexandria', 'sans-serif'],
      },
    },
  },
};
export default config;
