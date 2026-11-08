/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '360px',
      },
      colors: {
        // Dynamic Page & Surface tokens from CSS Variables
        page: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        'surface-soft': 'var(--bg-surface-soft)',

        // Dynamic Border tokens
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
        },

        // Dynamic Text tokens
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },

        // Platform & Storefront Accent (Defaults to Emerald #1F7A5A on Landing/Auth)
        accent: {
          DEFAULT: 'var(--accent, #1F7A5A)',
          hover: 'var(--accent-hover, #17634A)',
          soft: 'var(--accent-soft, #E4F1EB)',
          text: 'var(--accent-text, #FFFFFF)',
        },

        // Dedicated Storefront Tokens (BUG 10)
        'store-accent': 'var(--store-accent)',
        'store-accent-hover': 'var(--store-accent-hover)',
        'store-accent-soft': 'var(--store-accent-soft)',
        'store-on-accent': 'var(--store-on-accent)',

        // Platform Brand Tokens (BioMart green - independent of merchant accent)
        brand: {
          DEFAULT: 'var(--brand-primary, #1F7A5A)',
          hover: 'var(--brand-hover, #17634A)',
          soft: 'var(--brand-soft, #E4F1EB)',
          text: 'var(--brand-text, #FFFFFF)',
          border: 'var(--brand-border, #C8E2D6)',
        },

        // Dynamic Error Color
        danger: {
          DEFAULT: 'var(--error)',
        },
      },
      borderRadius: {
        btn: 'var(--radius-btn)',
        input: 'var(--radius-input)',
        card: 'var(--radius-card)',
      },
      fontFamily: {
        sans: ['var(--font-family)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['var(--font-heading)', 'var(--font-family)', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
      },
      letterSpacing: {
        tight: '-0.02em',
        heading: '-0.02em',
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        card: 'var(--shadow-card)',
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
