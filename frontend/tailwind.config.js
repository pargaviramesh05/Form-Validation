/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B1220',
          900: '#0F172A',
          800: '#16213A',
          700: '#1F2B47',
        },
        paper: '#F7F8FB',
        brand: {
          50: '#EFFBF6',
          100: '#D7F4E8',
          300: '#7FDDBB',
          500: '#1BAA7C',
          600: '#12855F',
          700: '#0D6749',
        },
        amber: {
          400: '#F4A83C',
          500: '#E8912A',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)',
        panel: '0 2px 8px rgba(15, 23, 42, 0.06), 0 16px 48px rgba(15, 23, 42, 0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
