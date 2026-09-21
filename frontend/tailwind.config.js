/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bot: '#00D4AA',
        background: '#0a0f1a',
      }
    },
  },
  plugins: [],
}
