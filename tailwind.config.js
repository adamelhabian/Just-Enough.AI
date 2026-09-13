/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        restaurant: {
          primary: '#199B74', // Emerald Green
          secondary: '#E5B141', // Gold
          accent: '#B94419', // Rust/Red
          red: '#B94419', // Specific brand red
          background: '#DBD9D5', // Light Gray
          dark: '#56473A', // Dark Brown
          waste: '#B94419', // Using Rust for waste/risk
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
