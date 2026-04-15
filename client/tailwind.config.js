/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: 'var(--ivory)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        charcoal: 'var(--charcoal)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
