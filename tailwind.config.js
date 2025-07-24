/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        neonBlue: '#00f0ff',
        neonPurple: '#a259ff',
        darkBg: '#0a0a23',
      },
      boxShadow: {
        neon: '0 0 8px #00f0ff, 0 0 16px #a259ff',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/line-clamp'),
  ],
}
