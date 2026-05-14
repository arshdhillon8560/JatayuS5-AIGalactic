/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sky: { DEFAULT: '#0ea5e9', dark: '#0284c7', light: '#e0f2fe', lighter: '#f0f9ff' },
        brand: { slate: '#1e293b', muted: '#64748b' }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
