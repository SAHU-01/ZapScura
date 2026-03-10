/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        zap: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        scura: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        accent: {
          cyan: '#22d3ee',
          purple: '#c084fc',
          green: '#34d399',
          amber: '#fbbf24',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-zap': 'radial-gradient(ellipse at center, rgba(14,165,233,0.15) 0%, transparent 70%)',
        'glow-scura': 'radial-gradient(ellipse at center, rgba(217,70,239,0.08) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(14,165,233,0.3)',
        'glow-md': '0 0 25px -5px rgba(14,165,233,0.4)',
        'glow-lg': '0 0 40px -8px rgba(14,165,233,0.5)',
        'glow-purple': '0 0 20px -4px rgba(217,70,239,0.3)',
        'glow-green': '0 0 20px -4px rgba(52,211,153,0.3)',
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
