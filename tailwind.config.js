/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#0B1E3D',
          700: '#14315C',
          500: '#3B82F6',
        },
        accent: {
          emerald: '#10B981',
          red: '#EF4444',
          amber: '#F59E0B',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          500: '#64748B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        lg: '8px',
      },
      boxShadow: {
        sm: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
