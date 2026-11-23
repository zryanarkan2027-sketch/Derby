/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark navy/slate background system
        bg: {
          900: '#0a0e14',
          800: '#0f1620',
          700: '#161f2d',
          600: '#1c2838',
          500: '#243246',
        },
        // Derby brand lime (matches the logo, #C6F432)
        accent: {
          50: '#fbfeee',
          100: '#f5fdd8',
          200: '#ebfbb0',
          300: '#dff985',
          400: '#d4f65a',
          500: '#C6F432',
          600: '#a9d61e',
          700: '#84a816',
          800: '#637e14',
          900: '#435410',
        },
        // Red for live indicators
        live: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        // Neutral slate tones
        slatey: {
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
        },
        // Warning amber
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Noto Kufi Arabic', 'sans-serif'],
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.3)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', maxHeight: '0' },
          '100%': { opacity: '1', maxHeight: '600px' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
