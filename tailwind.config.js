/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10b981', // emerald-500
          light: '#34d399', // emerald-400
          dark: '#059669', // emerald-600
        },
        secondary: {
          DEFAULT: '#3b82f6', // blue-500
          light: '#60a5fa', // blue-400
          dark: '#2563eb', // blue-600
        },
        background: '#f8fafc', // slate-50
      },
      boxShadow: {
        soft: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
