/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f0ff',
          100: '#e5e5ff',
          200: '#d0d0ff',
          300: '#b3b3ff',
          400: '#8c8cff',
          500: '#667eea',
          600: '#5a67d8',
          700: '#4c51bf',
          800: '#3c3f9e',
          900: '#2d3178',
        },
        secondary: {
          400: '#9b6fc0',
          500: '#764ba2',
          600: '#5e3a82',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:  { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(102, 126, 234, 0.2)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(102, 126, 234, 0.15)' },
        },
      },
    },
  },
  plugins: [],
}
