import type { Config } from 'tailwindcss';

// Every brand colour is a CSS variable defined in app/globals.css, so the
// whole look can be changed from that one place.
const config: Config = {
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
        danger: 'hsl(var(--danger) / <alpha-value>)',
        ok: 'hsl(var(--ok) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
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
