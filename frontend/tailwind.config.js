/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette IvoireDrive
        primary: {
          DEFAULT: '#FF8C42',
          50: '#FFF4ED',
          100: '#FFE8D9',
          200: '#FFCFAD',
          300: '#FFB07E',
          400: '#FF8C42',
          500: '#FF7628',
          600: '#F55A0F',
          700: '#CC4000',
          800: '#A13300',
          900: '#7A2700',
        },
        secondary: {
          DEFAULT: '#00A86B',
          50: '#E6F7F0',
          100: '#CCEFE1',
          200: '#99DFC3',
          300: '#66CFA5',
          400: '#33BF87',
          500: '#00A86B',
          600: '#008656',
          700: '#006541',
          800: '#00432B',
          900: '#002216',
        },
        tertiary: {
          DEFAULT: '#FFFFF0',
          50: '#FFFFF0',
        },
        dark: {
          DEFAULT: '#2C3E50',
          50: '#F5F7F9',
          100: '#E8ECEF',
          200: '#C9D2DB',
          300: '#A4B3C0',
          400: '#7F8FA0',
          500: '#5D6F7E',
          600: '#3D4F5F',
          700: '#2C3E50',
          800: '#1E2C38',
          900: '#121B24',
        },
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
        info: '#3498DB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['2.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.75rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h4': ['1.375rem', { lineHeight: '1.5', fontWeight: '600' }],
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 12px rgba(0, 0, 0, 0.15)',
        'btn': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      aspectRatio: {
        'vehicle': '16 / 9',
      },
      screens: {
        'mobile': '640px',
        'tablet': '1024px',
      },
    },
  },
  plugins: [],
}
