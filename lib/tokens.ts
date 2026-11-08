/**
 * BioMart Design Tokens
 * 
 * Segregated Architecture (BUG 10):
 * - Brand Tokens: BioMart platform identity (Landing, Admin, Watermark)
 * - Store Tokens: Fully customizable per-merchant storefront tokens
 */

export const tokens = {
  colors: {
    // BioMart Platform Brand Tokens (--brand-*)
    brand: {
      primary: '#1F7A5A',
      hover: '#17634A',
      soft: '#E4F1EB',
      text: '#FFFFFF',
      border: '#C8E2D6',
    },
    // Default Storefront Tokens (--store-*)
    store: {
      accent: '#111827',
      hover: '#1f2937',
      soft: '#f3f4f6',
      onAccent: '#FFFFFF',
    },
    bg: {
      page: '#F7F6F2',
      surface: '#FFFFFF',
    },
    border: {
      default: '#E7E4DC',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B6B66',
    },
    error: {
      default: '#C2410C',
    },
  },
  radii: {
    button: '10px',
    input: '10px',
    card: '14px',
  },
  typography: {
    fontFamily: "'Onest', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
    },
    heading: {
      weight: 600,
      letterSpacing: '-0.02em',
    },
  },
  spacing: {
    unit: 8, // 8px grid base
  },
  shadows: {
    subtle: '0 1px 2px rgba(0, 0, 0, 0.04)',
    none: 'none',
  },
} as const;

export type DesignTokens = typeof tokens;
