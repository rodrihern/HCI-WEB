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
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        caption: 'var(--font-size-caption)',
        body: 'var(--font-size-body)',
        heading: 'var(--font-size-heading)',
      },
      lineHeight: {
        tight: '1.2',
        normal: '1.5',
      },
      fontWeight: {
        regular: '400',
        semibold: '600',
      },
    },
  },
  plugins: [],
}
