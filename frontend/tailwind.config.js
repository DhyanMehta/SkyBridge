/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        skybridge: {
          navy: '#1E3A5F',
          bg: '#FAFAF9',
          border: '#E7E5E4',
          textMain: '#1C1917',
          textMuted: '#78716C',
        },
        status: {
          cancelledBg: '#FEF2F2',
          cancelledText: '#B91C1C',
          delayedLongBg: '#FFF7ED',
          delayedLongText: '#C2410C',
          delayedShortBg: '#FFFBEB',
          delayedShortText: '#A16207',
          onTimeBg: '#F0FDF4',
          onTimeText: '#15803D',
          escalateBg: '#EFF6FF',
          escalateText: '#1E3A5F',
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 200ms ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
