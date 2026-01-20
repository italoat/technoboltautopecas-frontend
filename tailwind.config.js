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
          400: '#38bdf8',
          500: '#0ea5e9', // Azul TechnoBolt Principal
          600: '#0284c7',
          900: '#0c4a6e',
        },
        industrial: {
          500: '#f59e0b', // Laranja Alerta/Atenção
          600: '#d97706',
        },
        danger: {
          500: '#ef4444', // Vermelho Crítico
        },
        success: {
          500: '#10b981', // Verde Sucesso
        },
        dark: {
          bg: '#0f172a',      // Fundo Principal (Slate 900)
          surface: '#1e293b', // Cards/Modais (Slate 800)
          input: '#334155',   // Inputs (Slate 700)
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
