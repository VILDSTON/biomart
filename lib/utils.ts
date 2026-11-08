import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number to Russian currency format with spaces:
 * 320000 => "320 000 сум"
 */
export function formatPrice(price: number, currency: string = 'сум'): string {
  const formatted = Math.round(price)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} ${currency}`;
}

/**
 * Calculates discount percentage
 */
export function calculateDiscount(price: number, oldPrice?: number | null): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/**
 * Formats date into readable Russian format
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Normalizes phone numbers (e.g. +998901234567)
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('998') && !cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  return cleaned;
}

/**
 * Returns public canonical URL for a store (defaults to biomart.uz, never leaks localhost)
 */
export function getStoreUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://biomart.uz';
  const cleanBase = base.replace(/\/$/, '');
  return `${cleanBase}/${slug}`;
}

export function getStoreDisplayUrl(slug: string): string {
  return `biomart.uz/${slug}`;
}

/**
 * Calculates optimal text color (#FFFFFF or #1A1A1A) based on background luminance for WCAG contrast
 */
export function getContrastTextColor(hexColor?: string): string {
  if (!hexColor) return '#FFFFFF';
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6) return '#FFFFFF';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#1A1A1A' : '#FFFFFF';
}

