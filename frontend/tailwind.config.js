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
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0073e6',
          600: '#005ab3',
          700: '#004080',
          800: '#00264d',
          900: '#000d1a',
        }
      },
    },
  },
  plugins: [],
}