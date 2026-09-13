/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shortage: '#D32F2F',
        waste: '#F57F17',
        normal: '#2E7D32',
      }
    },
  },
  plugins: [],
}
