/** @type {import('tailwindcss').Config} */
export default {
  // Menentukan file mana yang di-scan untuk class Tailwind
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Warna custom untuk tema SisaDapur
      colors: {
        primary: {
          50:  '#fef9ee',
          100: '#fdefd4',
          400: '#f97316',
          500: '#ea580c',
          600: '#c2410c',
        },
        secondary: {
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        }
      },
      // Font family custom
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // Animasi custom untuk kartu resep
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
