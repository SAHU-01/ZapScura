/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        shield: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0d1a6b',
        },
        accent: {
          cyan: '#00e5ff',
          purple: '#b388ff',
          green: '#00e676',
          amber: '#ff9100',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-shield': 'radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)',
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(0,229,255,0.08) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(59,130,246,0.3)',
        'glow-md': '0 0 25px -5px rgba(59,130,246,0.4)',
        'glow-lg': '0 0 40px -8px rgba(59,130,246,0.5)',
        'glow-cyan': '0 0 20px -4px rgba(0,229,255,0.3)',
        'glow-green': '0 0 20px -4px rgba(0,230,118,0.3)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
