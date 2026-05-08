/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bc-black':     '#09090e',
        'bc-dark':      '#111119',
        'bc-panel':     '#181826',
        'bc-border':    '#5252c8',
        'bc-track':     '#272748',
        'bc-text':      '#f5f2ff',
        'bc-accent':    '#a78bfa',
        'bc-rose':      '#f472b6',
        'bc-green':     '#5eead4',
        'bc-green-dim': '#2dd4bf',
        'bc-amber':     '#fbbf24',
        'bc-red':       '#f87171',
        'bc-blue':      '#60a5fa',
        'bc-violet':    '#7c3aed',
        'bc-muted':     '#8888b0',
        'bc-orange':    '#f43f5e',
      },
      fontFamily: {
        display: ['"Orbitron"', 'sans-serif'],
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"Space Mono"', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        'card': '10px',
      },
      animation: {
        'scanline':   'scanline 12s linear infinite',
        'blink':      'blink 1.2s step-end infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker':    'flicker 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.94' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.90' },
          '99%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
