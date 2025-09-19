/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}', 
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
],
  theme: {
    extend: {
      // Custom font family
      fontFamily: {
        'cormorant': ['Cormorant Garamond', 'serif'],
        'sans': ['Cormorant Garamond', 'serif'],
        'serif': ['Cormorant Garamond', 'serif'],
      },

      // Brown/Cream/Amber color palette
      colors: {
        'cream': {
          50: '#fefcf9',
          100: '#faf8f5',
          200: '#f5f1eb',
          300: '#f0e6d2',
          400: '#e8d5b7',
          500: '#ddbf94',
          600: '#d4a574',
          700: '#c4915c',
          800: '#b8860b',
          900: '#a0522d',
        },
        'brown': {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#8b4513',
          800: '#723b13',
          900: '#5d2f0a',
        },
        'amber': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      
      // Custom animations for the animated grid background
      animation: {
        'scroll-down': 'scroll-down 60s linear infinite',
        'scroll-up': 'scroll-up 60s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'gentle-pulse': 'gentle-pulse 2s ease-in-out infinite',
      },
      
      // Custom keyframes for smooth animations
      keyframes: {
        'scroll-down': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'scroll-up': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-0.5deg)' },
        },
        'gentle-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },
      
      // Enhanced backdrop blur for glassmorphism effect
      backdropBlur: {
        'xs': '2px',
      },
      
      // Custom shadows for floating card effect with brown tones
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(139, 69, 19, 0.2)',
        'float': '0 25px 50px -12px rgba(139, 69, 19, 0.15)',
        'brown': '0 10px 25px -5px rgba(160, 82, 45, 0.1)',
        'amber': '0 10px 25px -5px rgba(245, 158, 11, 0.1)',
      },
      
      // Extra curvy border radius options
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Custom spacing for better layout
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      }
    },
  },
  plugins: [],
}