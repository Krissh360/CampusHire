/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        'chart-1': 'hsl(var(--chart-1) / <alpha-value>)',
        'chart-2': 'hsl(var(--chart-2) / <alpha-value>)',
        'chart-3': 'hsl(var(--chart-3) / <alpha-value>)',
        'chart-4': 'hsl(var(--chart-4) / <alpha-value>)',
        'chart-5': 'hsl(var(--chart-5) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 0.75rem)',
        md: 'calc(var(--radius) - 0.5rem)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 0.5rem)',
      },
      boxShadow: {
        sm: '0 1px 2px hsl(var(--foreground) / 0.04)',
        DEFAULT: '0 1px 2px hsl(var(--foreground) / 0.04)',
        md: '0 1px 3px hsl(var(--foreground) / 0.06)',
      },
      spacing: {
        0.5: '0.23rem',
        1: '0.46rem',
        1.5: '0.69rem',
        2: '0.92rem',
        2.5: '1.15rem',
        3: '1.38rem',
        3.5: '1.61rem',
        4: '1.84rem',
        5: '2.3rem',
        6: '2.76rem',
        7: '3.22rem',
        8: '3.68rem',
        10: '4.6rem',
        12: '5.52rem',
        16: '7.36rem',
        20: '9.2rem',
        24: '11.04rem',
        32: '14.72rem',
      },
    },
  },
  plugins: [],
}
