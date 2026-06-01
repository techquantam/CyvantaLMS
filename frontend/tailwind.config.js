/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f4f3ff',
          100: '#ebe9fe',
          200: '#d8d4fd',
          300: '#b8b0fc',
          400: '#9483fa',
          500: '#7053f7',
          600: '#5c35eb',
          700: '#4e25d4',
          800: '#411eb3',
          900: '#371a93',
          950: '#210e62',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
