/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.055)',
          strong:  'rgba(255,255,255,0.08)',
          dark:    'rgba(10,14,26,0.75)',
        },
        app: {
          bg:      '#0a0e1a',
          surface: '#0d1224',
          border:  'rgba(255,255,255,0.09)',
        },
      },
      backgroundImage: {
        'gradient-accent':      'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'gradient-accent-blue': 'linear-gradient(135deg, #3b82f6, #6366f1)',
        'gradient-app':         'linear-gradient(180deg, #0a0e1a 0%, #0d1224 50%, #0a0e1a 100%)',
        'card-gradient':        'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
      },
      boxShadow: {
        glass:    '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-sm':'0 4px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg':'0 16px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10)',
        accent:   '0 8px 28px rgba(99,102,241,0.35)',
        'accent-lg':'0 12px 36px rgba(99,102,241,0.4)',
        nav:      '0 -4px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow:     '0 0 20px rgba(99,102,241,0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
