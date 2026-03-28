import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        tile: '0 10px 30px -20px rgba(28, 54, 39, 0.55)'
      }
    }
  },
  plugins: []
};

export default config;
