export interface Testimonial {
  name: string;
  shop: string;
  role: string;
  text: string;
  rating: number;
}

/**
 * Merchant testimonials for the landing page proof section.
 * The section is conditionally rendered only if this array is non-empty.
 * While empty, the ShowcaseSection ("Примеры витрин") is displayed instead.
 */
export const testimonials: Testimonial[] = [];
