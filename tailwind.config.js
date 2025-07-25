/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      animation: {
        neonPulse: 'neonPulse 1.2s infinite alternate',
        fadeIn: 'fadeIn 0.6s ease',
      },
      keyframes: {
        neonPulse: {
          '0%': { boxShadow: '0 0 8px #0ff, 0 0 16px #f0f' },
          '100%': { boxShadow: '0 0 24px #0ff, 0 0 48px #f0f' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/line-clamp'),
  ],
}
