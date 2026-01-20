/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bolt: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9', // Azul TechnoBolt principal
          600: '#0284c7',
          900: '#0c4a6e', // Azul Profundo para contrastes
        },
        dark: {
          bg: '#0f172a', // Fundo moderno escuro
          surface: '#1e293b', // Cards
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Fonte limpa e moderna
      },
    },
  },
  plugins: [],
}
