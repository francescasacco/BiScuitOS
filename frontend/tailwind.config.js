/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bc-black':  '#0e0e16',
        'bc-dark':   '#14141f',
        'bc-panel':  '#1a1a28',
        'bc-border': '#e82fa8',
        'bc-green':  '#39ff88',
        'bc-green-dim': '#25bb60',
        'bc-amber':  '#ffb838',
        'bc-red':    '#ff6050',
        'bc-blue':   '#6abaff',
        'bc-violet': '#ff2db8',
        'bc-muted':  '#9878b0',
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', '"Courier New"', 'monospace'],
        display: ['"Orbitron"', 'monospace'],
        ui: ['"VT323"', 'monospace'],
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'blink': 'blink 1.2s step-end infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'flicker': 'flicker 4s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.6' },
          '99%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
