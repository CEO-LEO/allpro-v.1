/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable dark mode via class strategy
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      // "Golden Hunter" Premium Font Family
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      // Premium Color Palette
      colors: {
        // Legacy colors (keep for compatibility)
        primary: {
          DEFAULT: '#FF5722',
          dark: '#E64A19',
        },
        secondary: '#FFA726',
        
        // "Golden Hunter" Brand Colors
        brand: {
          50: '#fffbeb',   // Lightest cream
          100: '#fef3c7',  // Light gold
          200: '#fde68a',  // Soft gold
          300: '#fcd34d',  // Medium gold
          400: '#fbbf24',  // Bright gold
          500: '#f59e0b',  // Primary Action - Golden
          600: '#d97706',  // Hover state - Deeper gold
          700: '#b45309',  // Active state
          800: '#92400e',  // Dark gold
          900: '#78350f',  // Deepest - Premium
        },
        
        // Dark Mode Palette
        dark: {
          bg: '#0f172a',      // Slate 900 - Main background
          surface: '#1e293b', // Slate 800 - Card surface
          border: '#334155',  // Slate 700 - Borders
          hover: '#475569',   // Slate 600 - Hover states
        },
      },
      // Friendly Rounded Corners
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',  // Card radius
        '3xl': '2rem',    // Large containers
      },
      // Responsive Typography System
      fontSize: {
        // Display (Hero sections, landing pages)
        'display-lg': ['clamp(2.5rem, 6vw, 4rem)', { lineHeight: '1.1', fontWeight: '800' }],
        'display': ['clamp(2rem, 5vw, 3rem)', { lineHeight: '1.2', fontWeight: '700' }],
        
        // Headings
        'h1': ['clamp(1.75rem, 4vw, 2.25rem)', { lineHeight: '1.3', fontWeight: '700' }],
        'h2': ['clamp(1.5rem, 3.5vw, 1.875rem)', { lineHeight: '1.3', fontWeight: '700' }],
        'h3': ['clamp(1.25rem, 3vw, 1.5rem)', { lineHeight: '1.4', fontWeight: '600' }],
        'h4': ['clamp(1.125rem, 2.5vw, 1.25rem)', { lineHeight: '1.4', fontWeight: '600' }],
        
        // Body text
        'body-lg': ['clamp(1rem, 2.5vw, 1.125rem)', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['clamp(0.875rem, 2vw, 1rem)', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['clamp(0.8125rem, 1.8vw, 0.875rem)', { lineHeight: '1.5', fontWeight: '400' }],
        
        // Special use
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
        'label': ['0.875rem', { lineHeight: '1.3', fontWeight: '500' }],
        'button': ['0.9375rem', { lineHeight: '1', fontWeight: '600' }],
        
        // Legacy responsive (keep for compatibility)
        'responsive-sm': 'clamp(0.75rem, 2vw, 0.875rem)',
        'responsive-base': 'clamp(0.875rem, 2.5vw, 1rem)',
        'responsive-lg': 'clamp(1rem, 3vw, 1.125rem)',
        'responsive-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'responsive-2xl': 'clamp(1.5rem, 5vw, 2rem)',
      },
      // Premium Shadows
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 20px 60px -15px rgba(0, 0, 0, 0.12)',
        'glow-gold': '0 0 30px rgba(245, 158, 11, 0.3)',
        'glow-blue': '0 0 30px rgba(59, 130, 246, 0.3)',
      },
      // Animation
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

