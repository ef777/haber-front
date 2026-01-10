/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-heading)', 'Merriweather', 'Georgia', 'serif'],
        heading: ['var(--font-heading)', 'Merriweather', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        surface: 'var(--color-surface)',
        background: 'var(--color-background)',
      },
      backgroundColor: {
        surface: 'var(--color-surface)',
        background: 'var(--color-background)',
      },
      textColor: {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
      },
      borderColor: {
        DEFAULT: 'var(--color-border)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--color-text-primary)',
            a: {
              color: 'var(--color-primary)',
              '&:hover': {
                opacity: 0.8,
              },
            },
            h1: {
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text-primary)',
            },
            h2: {
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text-primary)',
            },
            h3: {
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text-primary)',
            },
            blockquote: {
              borderLeftColor: 'var(--color-primary)',
              color: 'var(--color-text-secondary)',
            },
          },
        },
      },
    },
  },
  plugins: [],
};
