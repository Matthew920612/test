/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'Inter', 'sans-serif'],
      },
      colors: {
        background: {
          white: 'white',
          'light-gray': 'rgba(0,0,0,0.04)',
          'white-80': 'rgba(255,255,255,0.8)',
          'dark': '#27272a'
        },
        foreground: {
          default: '#020617',
          mute: '#71717a',
          'accent-foreground': '#f4f4f5'
        },
        stroke: {
          gray: '#e4e4e7',
          'white-40': 'rgba(255,255,255,0.4)',
        },
        accent: {
          blue: '#2388ff'
        },
        success: {
          'success-soft': 'rgba(23,201,100,0.15)'
        },
        others: {
          'green-9': '#30a46c'
        }
      },
      boxShadow: {
        'surface': '0px 2px 4px 0px rgba(0,0,0,0.04), 0px 1px 2px 0px rgba(0,0,0,0.06), 0px 0px 1px 0px rgba(0,0,0,0.06)',
        'panel': '0px 1px 3px 0px rgba(25,33,61,0.1)',
        'tab': '0px 2px 8px 0px rgba(0,0,0,0.06)',
        'btn': 'inset 0px -2px 1px 0px rgba(0,0,0,0.18), inset 0px 2px 1px 0px rgba(255,255,255,0.22), 0px 2px 5px 0px rgba(0,0,0,0.2)'
      }
    },
  },
  plugins: [],
}
