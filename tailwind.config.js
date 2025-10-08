/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'verde-claro': '#8DAF7E',
        'fondo': '#FEFFF7',
        'verde-sidebar': '#68AE6F',
        'verde_contraste': '#5C805E',
      },
    },
  },
  plugins: [],
}
