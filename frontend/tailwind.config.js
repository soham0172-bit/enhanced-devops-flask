/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Display font for headings — sharp and technical
        display: ['DM Mono', 'monospace'],
        // Body font — clean, readable
        sans: ['Geist', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Core palette — true black base, zinc midtones, white text
        canvas: '#0a0a0a',
        surface: '#111111',
        elevated: '#1a1a1a',
        border: '#2a2a2a',
        muted: '#404040',
        dim: '#888888',
        text: '#f0f0f0',
        // Accent — a sharp amber-gold, not another blue/purple
        accent: '#f59e0b',
        'accent-dim': '#92400e',
        // Status colors
        green: '#22c55e',
        blue: '#3b82f6',
        red: '#ef4444',
        orange: '#f97316',
        purple: '#a855f7',
      },
    },
  },
  plugins: [],
}