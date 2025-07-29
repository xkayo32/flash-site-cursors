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
        primary: {
          50: '#e6e8ea',
          100: '#c2c7cc',
          200: '#9ba3ab',
          300: '#747f8a',
          400: '#566471',
          500: '#384958',
          600: '#14242f', // Cor principal
          700: '#0f1b24',
          800: '#0b141a',
          900: '#070d11',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#facc15', // Yellow accent
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'military-base': '#14242f',
        'military-dark': '#0b141a',
        'military-light': '#1f3440',
      },
      letterSpacing: {
        'widest': '0.1em',
        'widest-plus': '0.15em',
        'ultra-wide': '0.2em',
      },
      fontFamily: {
        'police-title': ['Orbitron', 'monospace'],
        'police-subtitle': ['Rajdhani', 'sans-serif'],
        'police-body': ['Rajdhani', 'sans-serif'],
        'police-numbers': ['Exo 2', 'sans-serif'],
        'police-primary': ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}