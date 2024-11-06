/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'node-generating': 'node-generating 2s ease-in-out infinite',
        'pulse-scale': 'pulse-scale 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'typing 2s steps(20, end)',
        'blink-caret': 'blink-caret .75s step-end infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        'node-generating': {
          '0%': { 
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(147, 51, 234, 0.7)',
            borderColor: 'rgba(147, 51, 234, 0.7)'
          },
          '50%': { 
            transform: 'scale(1.02)',
            boxShadow: '0 0 0 10px rgba(147, 51, 234, 0)',
            borderColor: 'rgba(147, 51, 234, 1)'
          },
          '100%': { 
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(147, 51, 234, 0)',
            borderColor: 'rgba(147, 51, 234, 0.7)'
          }
        },
        'pulse-scale': {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '0.8'
          },
          '50%': { 
            transform: 'scale(1.05)',
            opacity: '1'
          }
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' }
        },
        'blink-caret': {
          'from, to': { 'border-color': 'transparent' },
          '50%': { 'border-color': 'currentColor' }
        },
        fadeIn: {
          'from': { 
            opacity: '0',
            transform: 'scale(0.95)'
          },
          'to': { 
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
    },
  },
  plugins: [],
}
