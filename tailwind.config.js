/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        godspeed: {
          950: '#070B16',
          900: '#0B132B',
          850: '#111C3D',
          800: '#1C2A4F',
          700: '#283A66',
          600: '#3A5088',
          accent: '#2563EB',
          'accent-hover': '#1D4ED8',
          gold: '#D97706',
          'gold-light': '#F59E0B',
          'gold-subtle': '#FEF3C7',
          'gold-glow': 'rgba(217, 119, 6, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'premium': '0 20px 30px -10px rgba(11, 19, 43, 0.12)',
        'gold-badge': '0 2px 10px rgba(217, 119, 6, 0.25)'
      }
    },
  },
  plugins: [],
}
