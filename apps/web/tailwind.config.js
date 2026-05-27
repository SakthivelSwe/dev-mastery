/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── DevMastery Design System Colors ─────────────────────
      colors: {
        // Backgrounds
        'bg-primary':   '#0D1117',
        'bg-surface':   '#161B22',
        'bg-elevated':  '#21262D',
        'border-default': '#30363D',

        // Text
        'text-primary':   '#F0F6FC',
        'text-secondary': '#8B949E',

        // Brand Accents (per spec Section 8.1)
        'accent-java':    '#F89820',
        'accent-spring':  '#6DB33F',
        'accent-react':   '#61DAFB',
        'accent-angular': '#DD0031',
        'accent-kotlin':  '#7F52FF',
        'accent-ai':      '#4285F4',

        // Semantic
        'success':  '#3FB950',
        'warning':  '#D29922',
        'error':    '#F85149',
      },

      // ─── Typography ─────────────────────────────────────────
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        code:    ['JetBrains Mono', 'monospace'],
        mono:    ['JetBrains Mono', 'monospace'],
      },

      // ─── Animations ─────────────────────────────────────────
      animation: {
        'fade-in':      'fadeIn 0.3s ease-in-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(248, 152, 32, 0)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(248, 152, 32, 0.3)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // ─── Border radius ──────────────────────────────────────
      borderRadius: {
        'card': '12px',
      },

      // ─── Box shadows ────────────────────────────────────────
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5)',
        'glow-java':    '0 0 20px rgba(248,152,32,0.25)',
        'glow-spring':  '0 0 20px rgba(109,179,63,0.25)',
        'glow-react':   '0 0 20px rgba(97,218,251,0.25)',
        'glow-kotlin':  '0 0 20px rgba(127,82,255,0.25)',
        'glow-ai':      '0 0 20px rgba(66,133,244,0.25)',
      },

      // ─── Backgrounds ────────────────────────────────────────
      backgroundImage: {
        'gradient-java':   'linear-gradient(135deg, rgba(248,152,32,0.1) 0%, transparent 60%)',
        'gradient-spring': 'linear-gradient(135deg, rgba(109,179,63,0.1) 0%, transparent 60%)',
        'gradient-react':  'linear-gradient(135deg, rgba(97,218,251,0.1) 0%, transparent 60%)',
        'gradient-kotlin': 'linear-gradient(135deg, rgba(127,82,255,0.1) 0%, transparent 60%)',
        'gradient-ai':     'linear-gradient(135deg, rgba(66,133,244,0.1) 0%, transparent 60%)',
        'gradient-hero':   'radial-gradient(ellipse at top, rgba(66,133,244,0.08) 0%, transparent 60%)',
        'shimmer-bg':      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
