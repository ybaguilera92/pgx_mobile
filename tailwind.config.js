/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pgx: {
          primary: '#002E62',
          secondary: '#3C8DBC',
          hover: '#00224a',
        }
      }
    },
  },
  plugins: [],
}
