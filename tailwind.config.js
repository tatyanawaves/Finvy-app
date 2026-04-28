/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: '#4F8EF7',
        'mint-light': '#EBF2FF',
        'mint-bg': '#E0EEFF',
        dark: '#0F0F0F',
        'dark-2': '#1A1A1A',
        'dark-3': '#232323',
        'dark-card': '#1E1E1E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
