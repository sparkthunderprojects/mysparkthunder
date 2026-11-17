import type { Config } from 'tailwindcss';

// Every brand colour is a CSS variable defined in app/globals.css, so the
// whole look can be changed from that one place.
const config: Config = {
  // Only the Elixir staff area has dark: variants, and it is always light, so never follow the OS setting.
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'hsl(var(--ink) / <alpha-value>)',
        panel: 'hsl(var(--panel) / <alpha-value>)',
        raised: 'hsl(var(--raised) / <alpha-value>)',
        line: 'hsl(var(--line) / <alpha-value>)',
        bone: 'hsl(var(--bone) / <alpha-value>)',
        dim: 'hsl(var(--dim) / <alpha-value>)',
        volt: 'hsl(var(--volt) / <alpha-value>)',
        arc: 'hsl(var(--arc) / <alpha-value>)',
        danger: {
          DEFAULT: 'hsl(var(--danger) / <alpha-value>)',
          50: '#fef2f2',
          100: '#fee2e2',
          300: '#fca5a5',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          300: '#6ee7b7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        ok: 'hsl(var(--ok) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'Impact', 'sans-serif'],
        sans: ['"Hanken Grotesk Variable"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '2px',
        md: '3px',
        lg: '4px',
      },
    },
  },
  plugins: [],
};

export default config;
