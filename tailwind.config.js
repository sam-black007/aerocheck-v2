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
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#60a5fa',
        },
        secondary: '#8b5cf6',
        accent: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        bg: {
          DEFAULT: '#09090b',
          secondary: '#18181b',
          elevated: '#27272a',
          card: '#1c1c1f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
