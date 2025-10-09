/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verdeClaro: '#8DAF7E',
        fondo: '#FEFFF7',
        verdeSidebar: '#68AE6F',
        verdeContraste: '#5C805E',
      },
    },
  },
  plugins: [],
}
